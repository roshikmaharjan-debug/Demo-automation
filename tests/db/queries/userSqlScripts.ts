export const USER_QUERIES = {
  GET_ALL: `
    SELECT username, password, expected_type, expected_message
    FROM users
  `,
  FIND_BY_USERNAME: `
    SELECT username, password, expected_type, expected_message
    FROM users
    WHERE username = ?
  `,
  INSERT_LOGIN_RESULT: `
    INSERT INTO login_results (username, outcome, ran_at)
    VALUES (?, ?, ?)
  `,
  FIND_LOGIN_RESULTS_BY_USERNAME: `
    SELECT id, username, outcome, ran_at
    FROM login_results
    WHERE username = ?
  `,
  DELETE_ALL_LOGIN_RESULTS: `
    DELETE FROM login_results
  `,
} as const;
