import { createUsername } from "../../utils/stringNormalization";
import User from "../../models/User";

const resolvers = {
  Query: {},
  Mutation: {
    createCoach: async (_, args, { db }) => {
      const { name, surname, vat_numbrer, email, password } = args;
      const accref = "coach_id";

      let user = await User.getUserByEmail(email, db);

      if (user && user[accref]) {
        throw new Error("Email already exists");
      }

      const username = createUsername(name + surname);
      await db.query(
        "INSERT INTO coach (name, surname, username, vat_number) VALUES (?, ?, ?, ?)",
        [name, surname, username, vat_numbrer],
      );
      const coach = (await db.query("SELECT * FROM coach where username = ?", [username]))[0];

      if (!user) {
        await User.createUser({ email, password }, { db });
        user = await User.getUserByEmail(email, db);
        await sendVerifyEmail(email, createToken({ id: user.id, email: user.email }));
      }

      await User.updateAccRef({ user, ref: coach, accref }, { db });

      return true;
    },
  },
};

export default resolvers;
