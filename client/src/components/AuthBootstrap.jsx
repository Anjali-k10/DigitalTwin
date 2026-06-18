// import { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import App from '../App.jsx';
// import { restoreSession } from '../features/auth/authThunks.js';
// import { fetchCareerIntegrations } from '../features/careerIntegrations/careerIntegrationSlice.js';
// import { fetchHealthIntegration } from '../features/healthIntegration/healthIntegrationSlice.js';

// function AuthBootstrap() {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     dispatch(restoreSession())
//       .unwrap()
//       .then(() => {
//         dispatch(fetchCareerIntegrations());
//         dispatch(fetchHealthIntegration());
//       })
//       .catch(() => {});
//   }, [dispatch]);

//   return <App />;
// }

// export default AuthBootstrap;

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import App from '../App.jsx';
import { restoreSession } from '../features/auth/authThunks.js';
import { fetchCareerIntegrations } from '../features/careerIntegrations/careerIntegrationSlice.js';
import { fetchHealthIntegration } from '../features/healthIntegration/healthIntegrationSlice.js';

function AuthBootstrap() {
  const dispatch = useDispatch();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    // async function init() {
    //   try {
    //     await dispatch(restoreSession()).unwrap();

    //     dispatch(fetchCareerIntegrations());
    //     dispatch(fetchHealthIntegration());
    //   } catch (e) {
    //     console.log('restoreSession failed', e);
    //   } finally {
    //     setReady(true);
    //   }
    // }
    async function init() {
    try {
    console.log('1. Starting restoreSession');

    await dispatch(restoreSession()).unwrap();

    console.log('2. restoreSession success');

    await dispatch(fetchCareerIntegrations()).unwrap();

    console.log('3. career fetched');

    await dispatch(fetchHealthIntegration()).unwrap();

    console.log('4. health fetched');

  } catch (e) {
    console.log('AuthBootstrap error', e);
  } finally {
    console.log('5. App ready');

    setReady(true);
  }
}

    init();
  }, [dispatch]);

  if (!ready) {
  return (
    <div
      style={{
        height: '100vh',
        display: 'grid',
        placeItems: 'center',
        fontSize: '24px',
      }}
    >
      Loading AuthBootstrap...
    </div>
  );
}

  return <App />;
}

export default AuthBootstrap;