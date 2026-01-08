import { faker } from "@faker-js/faker";

const RECORD_COUNT = 200000;

const transactionTypes = ["buy", "sell", "transfer", "withdrawal", "deposit"];
const currencies = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"];
const statuses = ["completed", "pending", "failed", "cancelled"];
const paymentMethods = ["credit_card", "debit_card", "bank_transfer", "crypto", "paypal"];

const categories = ["retail", "utilities", "entertainment", "travel", "healthcare", "food", "education", "technology", "services", "insurance"];
const deviceTypes = ["mobile", "desktop", "tablet"];
const tags = ["urgent", "recurring", "international", "high-value", "suspicious", "verified", "bulk", "subscription"];

function generateJsonRecord(): Record<string, unknown> {
  return {
    id: faker.string.uuid(),
    transaction_type: faker.helpers.arrayElement(transactionTypes),
    amount: parseFloat(faker.finance.amount({ min: 10, max: 100000, dec: 2 })),
    currency: faker.helpers.arrayElement(currencies),
    status: faker.helpers.arrayElement(statuses),
    account: faker.finance.accountName(),
    description: faker.finance.transactionDescription(),
    timestamp: faker.date.recent({ days: 365 }).toISOString(),
  };
}

function generateCsvRecord(clientId: number): Record<string, unknown> {
  const currency = faker.helpers.arrayElement(currencies);
  const amount = parseFloat(faker.finance.amount({ min: 10, max: 100000, dec: 2 }));
  const paymentMethod = faker.helpers.arrayElement(paymentMethods);
  const transactionType = faker.helpers.arrayElement(transactionTypes);
  const balanceBefore = parseFloat(faker.finance.amount({ min: 0, max: 1000000, dec: 2 }));

  // Calculate balance after based on transaction type
  let balanceAfter = balanceBefore;
  if (transactionType === "deposit") {
    balanceAfter = balanceBefore + amount;
  } else if (transactionType === "withdrawal") {
    balanceAfter = balanceBefore - amount;
  } else if (transactionType === "buy" || transactionType === "transfer") {
    balanceAfter = balanceBefore - amount;
  } else if (transactionType === "sell") {
    balanceAfter = balanceBefore + amount;
  }

  // Generate exchange rate for non-USD currencies
  const exchangeRate = currency === "USD" ? 1.0 : parseFloat(faker.finance.amount({ min: 0.5, max: 2.0, dec: 4 }));

  // Generate tags (1-3 random tags)
  const numTags = faker.number.int({ min: 1, max: 3 });
  const selectedTags = faker.helpers.arrayElements(tags, numTags);

  return {
    client_id: clientId,
    transaction_type: transactionType,
    amount,
    currency,
    status: faker.helpers.arrayElement(statuses),
    merchant_name: faker.company.name(),
    payment_method: paymentMethod,
    timestamp: faker.date.recent({ days: 365 }).toISOString(),
    client_name: faker.person.fullName(),
    client_email: faker.internet.email(),
    client_phone: faker.phone.number(),
    location_city: faker.location.city(),
    location_country: faker.location.country(),
    category: faker.helpers.arrayElement(categories),
    tags: selectedTags.join(","),
    fee_amount: parseFloat(faker.finance.amount({ min: 0, max: 50, dec: 2 })),
    tax_amount: parseFloat(faker.finance.amount({ min: 0, max: amount * 0.15, dec: 2 })),
    exchange_rate: exchangeRate,
    reference_number: faker.string.alphanumeric({ length: 12, casing: "upper" }),
    notes: faker.lorem.sentence(),
    device_type: faker.helpers.arrayElement(deviceTypes),
    ip_address: faker.internet.ip(),
    risk_score: faker.number.int({ min: 0, max: 100 }),
    approval_required: faker.datatype.boolean(),
    processing_time_ms: faker.number.int({ min: 50, max: 5000 }),
    bank_reference: faker.string.alphanumeric({ length: 16, casing: "upper" }),
    card_last_four: paymentMethod.includes("card") ? faker.finance.creditCardNumber().slice(-4) : "",
    balance_before: balanceBefore,
    balance_after: Math.max(0, balanceAfter), // Ensure balance doesn't go negative
  };
}

function toCsvLine(record: Record<string, unknown>): string {
  const headers = Object.keys(record);
  const values = headers.map((header) => {
    const value = record[header];
    if (typeof value === "string" && value.includes(",")) {
      return `"${value}"`;
    }
    return String(value);
  });
  return values.join(",");
}

async function main(): Promise<void> {
  console.log(`Generating ${RECORD_COUNT} records...`);

  const jsonRecords: Array<Record<string, unknown>> = [];
  const csvLines: string[] = [];

  csvLines.push("client_id,transaction_type,amount,currency,status,merchant_name,payment_method,timestamp,client_name,client_email,client_phone,location_city,location_country,category,tags,fee_amount,tax_amount,exchange_rate,reference_number,notes,device_type,ip_address,risk_score,approval_required,processing_time_ms,bank_reference,card_last_four,balance_before,balance_after");

  for (let i = 0; i < RECORD_COUNT; i++) {
    jsonRecords.push(generateJsonRecord());
    csvLines.push(toCsvLine(generateCsvRecord(i + 1)));

    if ((i + 1) % 10000 === 0) {
      console.log(`  Progress: ${i + 1}/${RECORD_COUNT}`);
    }
  }

  const jsonContent = JSON.stringify(jsonRecords, null, 2);
  const csvContent = csvLines.join("\n");

  await Bun.write("transactions.json", jsonContent);
  console.log("  Written: transactions.json");

  await Bun.write("transactions.csv", csvContent);
  console.log("  Written: transactions.csv");

  console.log("Done!");
}

main().catch(console.error);
