#!/usr/bin/env node
/**
 * Script para crear las tablas DynamoDB necesarias para el CRM
 * Uso: node scripts/create-tables.mjs
 * 
 * Requiere:
 * - AWS CLI configurado con credenciales
 * - Permisos para crear tablas DynamoDB
 */

import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ 
  region: process.env.REGION || process.env.AWS_REGION || "us-east-1" 
});

const TABLES = [
  {
    TableName: process.env.CRM_USERS_TABLE || "CRM-Users",
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST", // On-demand pricing
  },
  {
    TableName: process.env.CRM_PARTICIPANTS_TABLE || "CRM-Participants",
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: process.env.CRM_CAMPAIGNS_TABLE || "CRM-Campaigns",
    KeySchema: [
      { AttributeName: "pk", KeyType: "HASH" },
      { AttributeName: "sk", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "pk", AttributeType: "S" },
      { AttributeName: "sk", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
];

async function createTable(tableConfig) {
  const tableName = tableConfig.TableName;
  
  try {
    console.log(`📝 Creando tabla: ${tableName}...`);
    
    await client.send(new CreateTableCommand(tableConfig));
    
    console.log(`✅ Tabla ${tableName} creada exitosamente!`);
    console.log(`   Esperando a que la tabla esté activa...`);
    
    // Wait for table to be active
    let attempts = 0;
    while (attempts < 30) {
      const { Table } = await client.send(
        new DescribeTableCommand({
          TableName: tableName,
        })
      );
      
      if (Table?.TableStatus === "ACTIVE") {
        console.log(`   ✅ Tabla ${tableName} está activa!`);
        break;
      }
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;
    }
    
    if (attempts >= 30) {
      console.warn(`   ⚠️  Tabla ${tableName} aún no está activa después de 60 segundos`);
    }
  } catch (error) {
    if (error.name === "ResourceInUseException") {
      console.log(`   ⚠️  Tabla ${tableName} ya existe, omitiendo...`);
    } else {
      console.error(`   ❌ Error creando tabla ${tableName}:`, error.message);
      throw error;
    }
  }
}

async function main() {
  console.log("🚀 Creando tablas DynamoDB para PrecoTracks CRM...\n");
  
  try {
    for (const tableConfig of TABLES) {
      await createTable(tableConfig);
      console.log();
    }
    
    console.log("✅ ¡Todas las tablas han sido creadas exitosamente!");
    console.log("\n📋 Próximos pasos:");
    console.log("   1. Configura las variables de entorno en .env.local");
    console.log("   2. Crea un usuario inicial:");
    console.log(`      node scripts/init-user.mjs admin@precotracks.org "Admin User" admin`);
    console.log("   3. Configura AWS SES (verifica dominio/email)");
    console.log("   4. Inicia el servidor: npm run dev");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\n💡 Asegúrate de:");
    console.error("   - Tener AWS CLI configurado con credenciales válidas");
    console.error("   - Tener permisos para crear tablas DynamoDB");
    console.error("   - Estar en la región correcta (us-east-1 por defecto)");
    process.exit(1);
  }
}

main();

