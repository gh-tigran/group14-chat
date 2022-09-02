import { Users, Messages } from "../models";

async function main() {
  for (const Model of [
    Users,
    Messages
  ]) {
    console.log(Model)
    await Model.sync({ alter: true })
  }
  process.exit(0)
}

main()
