let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;

const listeners: Array<(width: number, height: number) => void> = [];

window.addEventListener('resize', () => {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;

    for (const listener of listeners) {
        listener(SCREEN_WIDTH, SCREEN_HEIGHT);
    }
});

export function addScreenSizeListener(listener: (width: number, height: number) => void) {
    listeners.push(listener);
    listener(SCREEN_WIDTH, SCREEN_HEIGHT);
}
