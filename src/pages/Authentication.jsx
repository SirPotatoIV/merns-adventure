import { useEffect, useState } from "react";

import { Button } from "primereact/button";
import { Card } from "primereact/card";

import { handleAuthenticationError } from "../utils/MongoDB";

export const Authentication = ({ app, setCurrentUser, setCurrentPlayer, setPlayers, Realm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [signUpMessage, setSignUpMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  // Followed code from MongoDB example for error handling https://github.com/mongodb-university/realm-tutorial-web/blob/final/src/components/LoginScreen.js
  const [error, setError] = useState({});

  // Used to clear messages to the user when the component re-renders
  useEffect(() => {
    setError({});
    setSignUpMessage("");
    setResetMessage("");
  }, []);

  const signUpUser = async (event) => {
    event.preventDefault();
    try {
      await app.emailPasswordAuth.registerUser(newEmail, newPassword);
      setSignUpMessage("Success! Check your e-mail to confirm your account!");
    } catch (error) {
      handleAuthenticationError(error, setError);
      console.error(error);
    }
  };

  const loginUser = async (event) => {
    event.preventDefault();
    // * MongoDB Realm email/password login: https://docs.mongodb.com/realm/web/authenticate/#std-label-web-login-email-password
    const credentials = Realm.Credentials.emailPassword(email, password);
    try {
      const user = await app.logIn(credentials);
      setEmail("");
      setPassword("");
      setupPlayer();
      setCurrentUser(user);
    } catch (error) {
      handleAuthenticationError(error, setError);
      console.error(error);
    }
  };

  const setupPlayer = async () => {
    // * Created collection handle following the MongoDB Data Access setup guide: https://docs.mongodb.com/realm/web/mongodb/#set-up-your-project
    const mongodb = app.currentUser.mongoClient("mongodb-atlas");
    const playerCollection = mongodb.db("mernsAdventure").collection("players");
    setPlayers(playerCollection);

    try {
      // Have to use playerCollection, because players will not have a value until after the first render cycle
      const player = await playerCollection.findOne({
        _id: app.currentUser.id,
      });
      setCurrentPlayer(player);
    } catch (err) {
      console.error(err);
    }
  };

  const resetPassword = async () => {
    try {
      // https://docs.mongodb.com/realm/web/manage-email-password-users/#reset-a-user-s-password
      // await app.emailPasswordAuth.sendResetPasswordEmail(email);
      setResetMessage("Password has been reset! Check for e-mail for further instructions.");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="p-text-center p-p-3">MERN's Point and Click Adventure</h1>
      <Card className="p-m-3" title="Log in">
        <form className="p-d-flex p-flex-column" onSubmit={loginUser}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            type="email"
            className="p-inputtext"
            value={email}
          />

          <label className="p-mt-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            type="password"
            className="p-inputtext"
            value={password}
          />
          <Button className="p-mt-2" label="Log In" icon="pi pi-sign-in" />
        </form>

        <Button className="p-button-text" label="Reset Password" icon="pi pi-replay" onClick={resetPassword} />
        <p>{resetMessage}</p>
      </Card>

      <Card className="p-m-3" title="Sign Up">
        <form className="p-d-flex p-flex-column" onSubmit={signUpUser}>
          <label htmlFor="newEmail">E-mail</label>
          <input
            id="newEmail"
            className="p-inputtext"
            onChange={(e) => {
              setNewEmail(e.target.value);
            }}
            value={newEmail}
          />
          <label htmlFor="newPassword">Password</label>
          <input
            id="newPassword"
            className="p-inputtext p-mt-2"
            onChange={(e) => {
              setNewPassword(e.target.value);
            }}
            value={newPassword}
          />
          <Button className="p-mt-2" label="Sign Up" icon="pi pi-plus" />
          <p>{signUpMessage}</p>
          <p>{error.password}</p>
          <p>{error.email}</p>
        </form>
      </Card>

      <div className="p-m-3">
        <ul>
          <li>
            Source Code: <a href="https://github.com/JakeOTooleDev/merns-adventure">Repository</a>
          </li>
          <li>
            Created by: <a href="https://www.jakeotoole.com">Jake O'Toole</a>
          </li>
        </ul>
      </div>
    </div>
  );
};
export default Authentication;
