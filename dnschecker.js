const dns = require('dns').promises;

async function lookupDNS(domain) {
  try {
    // Get A records (IPv4 addresses)
    const ARecords = await dns.resolve4(domain);
    console.log(`A records (IPv4): ${ARecords.join(', ')}`);
  } catch (error) {
    console.error(`Error fetching A records: ${error.message}`);
  }

  try {
    // Get AAAA records (IPv6 addresses)
    const AAAARecords = await dns.resolve6(domain);
    console.log(`AAAA records (IPv6): ${AAAARecords.join(', ')}`);
  } catch (error) {
    console.error(`Error fetching AAAA records: ${error.message}`);
  }

  try {
    // Get MX records (Mail servers)
    const MXRecords = await dns.resolveMx(domain);
    console.log('MX records (Mail servers):');
    MXRecords.forEach((mx) => {
      console.log(`  Priority: ${mx.priority}, Exchange: ${mx.exchange}`);
    });
  } catch (error) {
    console.error(`Error fetching MX records: ${error.message}`);
  }

  try {
    // Get CNAME records (Canonical name)
    const CNAMERecords = await dns.resolveCname(domain);
    console.log(`CNAME records (Canonical name): ${CNAMERecords.join(', ')}`);
  } catch (error) {
    console.error(`Error fetching CNAME records: ${error.message}`);
  }

  try {
    // Get TXT records (Text records)
    const TXTRecords = await dns.resolveTxt(domain);
    console.log('TXT records (Text records):');
    TXTRecords.forEach((record) => {
      console.log(`  ${record.join(' ')}`);
    });
  } catch (error) {
    console.error(`Error fetching TXT records: ${error.message}`);
  }

  try {
    // Get NS records (Name servers)
    const NSRecords = await dns.resolveNs(domain);
    console.log(`NS records (Name servers): ${NSRecords.join(', ')}`);
  } catch (error) {
    console.error(`Error fetching NS records: ${error.message}`);
  }

  try {
    // Get SOA records (Start of Authority)
    const SOARecord = await dns.resolveSoa(domain);
    console.log('SOA record (Start of Authority):');
    console.log(`  nsname: ${SOARecord.nsname}`);
    console.log(`  hostmaster: ${SOARecord.hostmaster}`);
    console.log(`  serial: ${SOARecord.serial}`);
    console.log(`  refresh: ${SOARecord.refresh}`);
    console.log(`  retry: ${SOARecord.retry}`);
    console.log(`  expire: ${SOARecord.expire}`);
    console.log(`  minttl: ${SOARecord.minttl}`);
  } catch (error) {
    console.error(`Error fetching SOA record: ${error.message}`);
  }

  try {
    // Get PTR records (Reverse DNS)
    const PTRRecords = await dns.reverse('93.184.216.34');
    console.log(`PTR records (Reverse DNS): ${PTRRecords.join(', ')}`);
  } catch (error) {
    console.error(`Error fetching PTR records: ${error.message}`);
  }
}

// Replace 'example.com' with the domain you want to query
lookupDNS('example.com');
