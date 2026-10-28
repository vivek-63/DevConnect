const prisma = require("./database");
async function main(){
   const user = await prisma.user.findMany();
  console.log(user);
}

main();