declare const _: {
  ver: '2.1';
  link: {
    basePage: () => void;
    defTitle: string;
    actions: Record<string, (val: string) => void>;
    commands: Record<string, (val: string) => void>;
    _cmd: string[];
    _i: boolean;

    compile: () => string[];
    set: (page: string, title?: string) => void;
    add: (cmd: string) => void;
    remove: (cmd: string) => void;
    get: () => void;
  };
  lazy: {
    loaded: Record<string, boolean | Promise<unknown>>;
    load: (url: string, ...args: any[]) => Promise<any[]>;
    register: (scr: string, funcs: string[]) => Error | void;
    _(scr: string, fn: string): Promise<Function>;
  };
  lang: {
    addr: string;
    vars: Record<string, string | number>;
    main: Record<string, string>;
    _: (i: string) => string;
    load: (name: string) => Promise<string>;
    parse: (packet: string, vars?: Record<string, string | number>) => string;
    replace: (name: string) => Promise<string>;
    from: (i: string) => string;
    text: (i: string) => string;
    submit: (i: string) => string;
    input: (i: string) => string;
    textarea: (i: string) => string;
    img: (i: string) => string;
    win: (i: string) => string;
  };
  http: {
    defaultHeaders: Record<string, string>;
    req: (
      method: string,
      url: string,
      data?: any,
      headers?: Record<string, string>,
      fileProgressElement?: HTMLElement | false
    ) => Promise<any>;
  };
  $: {
    D: Document;
    id: (i: string) => HTMLElement | null;
    q: <T extends Element = Element>(i: string, p?: ParentNode) => T | null;
    qa: <T extends Element = Element>(i: string, p?: ParentNode) => NodeListOf<T>;
    on: <K extends keyof HTMLElementEventMap>(
      el: EventTarget,
      ev: K,
      fn: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
      opts?: boolean | AddEventListenerOptions
    ) => void;
    off: <K extends keyof HTMLElementEventMap>(
      el: EventTarget,
      ev: K,
      fn: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
      opts?: boolean | EventListenerOptions
    ) => void;
  };
  html: (strs: TemplateStringsArray, ...args: any[]) => HTMLElement | DocumentFragment;
  storage: {
    new (strg: Storage, name: string): {
      _: Storage;
      n: string;
      get: (key: string) => string | null;
      set: (key: string, value: string) => void;
      remove: (key: string) => void;
      clear: () => void;
    };
  };
  err: {
    print: (id: number, err: any) => void;
    errors: Record<number, any>;
    _c: number;
    log: (err: any) => void;
    handleGlobal: (
      message: string,
      source: string,
      line: number,
      column: number,
      error: Error
    ) => void;
    handleRejection: (e: PromiseRejectionEvent | any) => void;
  };
  hotkeys: {
    keys: Record<string, {
      keys: string[];
      press: (e: KeyboardEvent) => void;
      release: (e: KeyboardEvent) => void;
      active: boolean;
    }>;
    _holds: Set<string>;
    _: boolean;
    on: (
      combo: string,
      press?: (e: KeyboardEvent) => void,
      release?: (e: KeyboardEvent) => void
    ) => typeof _.hotkeys;
    off: (combo: string) => typeof _.hotkeys;
  };
  win: {
    manager: HTMLElement | false;
    hider: HTMLElement | false;

    winAttrs: string;
    dragAttrs: string;
    titleAttrs: string;
    renameAttrs: string;
    btnAttrs: string;
    hiderAttrs: string;

    defBtns: Array<[string, (win: WindowInstance) => void]>;

    animOpen: string;
    animClose: string;
    animHide: string;
    animShow: string;
    animFullOn: string;
    animFullOff: string;
    open: (
      name: string,
      content: string,
      customAttrs?: string
    ) => WindowInstance;
    setTitle: (win: WindowInstance, newTitle: string) => void;
    toggleFull: (win: WindowInstance) => void;
    close: (win: WindowInstance) => void;
    hide: (win: WindowInstance) => void;
    show: (win: WindowInstance) => void;
    _ID: () => string;
    _winBtn: (win: WindowInstance, text: string, func: (win: WindowInstance) => void) => HTMLButtonElement;
    _hiderBtn: (win: WindowInstance) => HTMLButtonElement;
    _initWin: (win: WindowInstance) => void;
  };
  wins: Record<string, WindowInstance>;
};
interface WindowInstance {
  id: string;
  name: string;
  langs: string | false;
  state: 'opened' | 'hidened';
  full: boolean;
  inRename: boolean;
  onUnfull: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  elem: HTMLElement;
  drag: HTMLElement;
  content: HTMLElement;

  setTitle: (newTitle: string) => void;
  toggleFull: (e?: Event) => void;
  close: (e?: Event) => void;
  hide: (e?: Event) => void;
  show: (e?: Event) => void;
}

export = _;
export as namespace _;