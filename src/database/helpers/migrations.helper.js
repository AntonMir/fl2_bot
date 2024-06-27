class MigrationsHelper {
  static triggerTypes = {
    BEFORE_INSERT: {
      key: 'BEFORE_INSERT',
      name: 'bi',
      sql: 'BEFORE INSERT',
    },
    AFTER_INSERT: {
      key: 'AFTER_INSERT',
      name: 'ai',
      sql: 'AFTER INSERT',
    },
    BEFORE_UPDATE: {
      key: 'BEFORE_UPDATE',
      name: 'bu',
      sql: 'BEFORE UPDATE',
    },
    AFTER_UPDATE: {
      key: 'AFTER_UPDATE',
      name: 'au',
      sql: 'AFTER UPDATE',
    },
    BEFORE_DELETE: {
      key: 'BEFORE_DELETE',
      name: 'bd',
      sql: 'BEFORE DELETE',
    },
    AFTER_DELETE: {
      key: 'AFTER_DELETE',
      name: 'ad',
      sql: 'AFTER DELETE',
    },
  };

  static extendQueryInterface(queryInterface) {
    queryInterface.createEnumType = ({ tableName, column, values, params }) => {
      return queryInterface.sequelize.query(
        `
				CREATE TYPE "enum_${tableName}_${column}"
				AS ENUM ('${values.join("', '")}');
			`,
        params,
      );
    };

    queryInterface.dropEnumType = ({ tableName, column, params }) => {
      return queryInterface.sequelize.query(
        `
				DROP TYPE "enum_${tableName}_${column}";
			`,
        params,
      );
    };

    queryInterface.createTableTrigger = ({
      tableName,
      triggerType,
      triggerFunction,
      params,
    }) => {
      if (!MigrationsHelper.triggerTypes[triggerType]) {
        throw new Error(`Unknown trigger type: ${triggerType}`);
      }

      return queryInterface.sequelize.query(
        `
				CREATE TRIGGER ${tableName}_${MigrationsHelper.triggerTypes[triggerType].name}_trigger
				  ${MigrationsHelper.triggerTypes[triggerType].sql}
				  ON ${tableName}
				  FOR EACH ROW
				  EXECUTE PROCEDURE ${triggerFunction}();
			`,
        params,
      );
    };

    queryInterface.dropTableTrigger = ({ tableName, triggerType, params }) => {
      if (!MigrationsHelper.triggerTypes[triggerType]) {
        throw new Error(`Unknown trigger type: ${triggerType}`);
      }

      return queryInterface.sequelize.query(
        `
				DROP TRIGGER IF EXISTS ${tableName}_${MigrationsHelper.triggerTypes[triggerType].name}_trigger ON ${tableName};
			`,
        params,
      );
    };

    queryInterface.createIndexes = async ({ tableName, indexes, params }) => {
      for (let index of indexes) {
        await queryInterface.addIndex(tableName, index.fields, {
          ...index,
          ...params,
        });
      }
    };

    queryInterface.dropIndexes = async ({ tableName, indexes, params }) => {
      for (let index of indexes) {
        await queryInterface.removeIndex(tableName, index.fields, params);
      }
    };

    queryInterface.createConstraints = async ({
      Op,
      tableName,
      constraints,
      params,
    }) => {
      for (let constraintName of Object.keys(constraints)) {
        let fields = constraintName.split(',');
        let constraint = constraints[constraintName];

        if (typeof constraint === 'function') {
          constraint = constraint(Op);
        }

        await queryInterface.addConstraint(tableName, {
          fields,
          ...constraint,
          ...params,
        });
      }
    };

    queryInterface.dropConstraints = async ({
      tableName,
      constraints,
      params,
    }) => {
      for (let constraintName of Object.keys(constraints)) {
        let fields = constraintName.split(',');
        let constraint = constraints[constraintName];

        if (constraint.type === 'foreign key') {
          let fk = `${tableName}_${fields.join('_')}_${constraint.references.table}_fk`;

          await queryInterface.removeConstraint(tableName, fk, {
            type: constraint.type,
            references: constraint.references,
            ...params,
          });
        } else if (constraint.type === 'check') {
          let fk = `${tableName}_${fields.join('_')}_${constraint.references.table}_ck`;

          await queryInterface.removeConstraint(tableName, fk, {
            type: constraint.type,
            ...params,
          });
        }
      }
    };

    queryInterface.createAdditionalMeta = async ({
      tableName,
      indexes,
      constraints,
      triggers = false,
      params,
      Op,
    }) => {
      await queryInterface.createIndexes({ tableName, indexes, params });

      await queryInterface.createConstraints({
        tableName,
        constraints,
        params,
        Op,
      });

      if (triggers) {
        await queryInterface.createTableTrigger({
          tableName,
          triggerType: MigrationsHelper.triggerTypes.AFTER_INSERT.key,
          triggerFunction: 'after_insert',
          params,
        });
        await queryInterface.createTableTrigger({
          tableName,
          triggerType: MigrationsHelper.triggerTypes.AFTER_UPDATE.key,
          triggerFunction: 'after_update',
          params,
        });
        await queryInterface.createTableTrigger({
          tableName,
          triggerType: MigrationsHelper.triggerTypes.AFTER_DELETE.key,
          triggerFunction: 'after_delete',
          params,
        });
      }
    };

    queryInterface.dropAdditionalMeta = async ({
      tableName,
      indexes,
      constraints,
      triggers = false,
      params,
    }) => {
      if (triggers) {
        await queryInterface.dropTableTrigger({
          tableName,
          triggerType: MigrationsHelper.triggerTypes.AFTER_INSERT.key,
          params,
        });
        await queryInterface.dropTableTrigger({
          tableName,
          triggerType: MigrationsHelper.triggerTypes.AFTER_UPDATE.key,
          params,
        });
        await queryInterface.dropTableTrigger({
          tableName,
          triggerType: MigrationsHelper.triggerTypes.AFTER_DELETE.key,
          params,
        });
      }

      await queryInterface.dropConstraints({ tableName, constraints, params });

      await queryInterface.dropIndexes({ tableName, indexes, params });
    };

    return queryInterface;
  }
}

module.exports = MigrationsHelper;
