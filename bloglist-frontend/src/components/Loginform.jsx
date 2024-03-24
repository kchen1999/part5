
const LoginForm = ({ handleLogin, handleUserNameChange, handlePasswordChange, username, password }) => {
  return (
    <form onSubmit={ handleLogin }>
      <div>
      username
        <input
          type="text"
          data-testid='username'
          value={username}
          name="username"
          onChange={handleUserNameChange}
        />
      </div>
      <div>
      password
        <input
          type="password"
          data-testid='password'
          value={password}
          name="password"
          onChange={handlePasswordChange}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )}

export default LoginForm