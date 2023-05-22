import React from 'react';

import { isAuth, saveAuth } from '../api';

export function LogoutButton() {
  React.useEffect(() => {}, []);

  return isAuth() ? (
    <button
      onClick={() => {
        saveAuth('');
        window.location.reload();
      }}
    >
      Выйти
    </button>
  ) : null;
}
