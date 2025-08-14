import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useNavigate } from "react-router-dom";
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      loginWith: {
        username: true,
        email: true,
      },
    },
  },
});

export default function SignUpPage() {
  const navigate = useNavigate();

  return (
    <Authenticator initialState="signUp">
      {({ signOut, user }) => (
        <main>
          <h1>認証完了 {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
          <button onClick={() => navigate("/")}>トップページへ</button>
        </main>
      )}
    </Authenticator>
  );
}
