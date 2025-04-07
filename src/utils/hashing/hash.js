import bcrypt from "bcrypt";

// hash
export const hash = ({ plainText, saltRounds = process.env.SALT }) => {
  return bcrypt.hashSync(plainText, Number(saltRounds));
};

// compare
export const compareHash = ({ plainText, hash }) => {
  if (!plainText || !hash) {
    console.error("❌ Missing plainText or hash:", { plainText, hash });
    return false;
  }
  return bcrypt.compareSync(plainText, hash);
};
