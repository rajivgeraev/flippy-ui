import {
  backButton,
  viewport,
  // themeParams,
  miniApp,
  initData,
  // $debug,
  disableVerticalSwipes,
  isVerticalSwipesEnabled,
  init as initSDK,
} from '@telegram-apps/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 */
export function init(): void {
  // Set @telegram-apps/sdk-react debug mode.
  // $debug.set(debug);

  // Initialize special event handlers for Telegram Desktop, Android, iOS, etc.
  // Also, configure the package.
  initSDK();

  // Mount all components used in the project.
  backButton.isSupported() && backButton.mount();
  miniApp.mount();
  initData.restore();
  void viewport.mount().then((data) => {
    // viewport.bindCssVars();

    // if (viewport.requestFullscreen.isAvailable()) {
    //   void viewport.requestFullscreen().then(() => {
    //     viewport.isFullscreen(); // true
    //   });
    // }
  }).catch(e => {
    console.error('Something went wrong mounting the viewport', e);
  });

  if (disableVerticalSwipes.isAvailable()) {
    disableVerticalSwipes();
    isVerticalSwipesEnabled(); // false
  }



}