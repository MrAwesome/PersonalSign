const maildrop = require("@maildrop/api");
const fs = require("fs");
const path = require("path");

const EMAIL_FILE = path.join(__dirname, ".maildropcc_email_addr");

(async ()=> {
  const emailAddr = fs.readFileSync(EMAIL_FILE).toString().trim();

  const mails = await maildrop.fetchMails(emailAddr);

  for (const mail of mails) {
    const { id, from, to, subject, date, body, html } = mail;

    console.log(`<td>${subject}<td>`);
  }
})()
