type Fiber = {
    type: string | Function;
    props: Props;
    dom?: HTMLElement | Text | null;
    parent?: Fiber;
    child?: Fiber;
    sibling?: Fiber;
    alternate?: Fiber;
    effectTag?: string;
    hooks?: Hook[];
  };
  
  type Hook = {
    state: any;
    queue: any[];
  };
  
  type Props = {
    [key: string]: any;
  };
  
  function createElement(type: string | Function, props: Props, ...children: any[]): Fiber {
    return {
      type,
      props: {
        ...props,
        children: children.map((child) =>
          typeof child === "object" ? child : createTextElement(child)
        ),
      },
    };
  }
  
  function createTextElement(text: string): Fiber {
    return {
      type: "TEXT_ELEMENT",
      props: {
        nodeValue: text,
        children: [],
      },
    };
  }
  
  function createDom(fiber: Fiber): HTMLElement | Text {
    const dom =
      fiber.type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(fiber.type as string);
  
    updateDom(dom, {}, fiber.props);
  
    return dom;
  }
  
  const isEvent = (key: string) => key.startsWith("on");
  const isProperty = (key: string) => key !== "children" && !isEvent(key);
  const isNew = (prev: Props, next: Props) => (key: string) => prev[key] !== next[key];
  const isGone = (prev: Props, next: Props) => (key: string) => !(key in next);
  
  function updateDom(dom: HTMLElement | Text, prevProps: Props, nextProps: Props) {
    // Remove old or changed event listeners
    Object.keys(prevProps)
      .filter(isEvent)
      .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
      .forEach((name) => {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name]);
      });
  
    // Remove old properties
    Object.keys(prevProps)
      .filter(isProperty)
      .filter(isGone(prevProps, nextProps))
      .forEach((name) => {
        dom[name] = "";
      });
  
    // Set new or changed properties
    Object.keys(nextProps)
      .filter(isProperty)
      .filter(isNew(prevProps, nextProps))
      .forEach((name) => {
        dom[name] = nextProps[name];
      });
  
    // Add event listeners
    Object.keys(nextProps)
      .filter(isEvent)
      .filter(isNew(prevProps, nextProps))
      .forEach((name) => {
        const eventType = name.toLowerCase().substring(2);
        dom.addEventListener(eventType, nextProps[name]);
      });
  }
  
  function commitRoot() {
    commitWork(wipRoot.child);
    deletions.forEach(commitWork);
    deletions = []; // deletions 배열 초기화
    currentRoot = wipRoot;
    wipRoot = null;
  }
  
  function commitWork(fiber: Fiber) {
    if (!fiber) {
      return;
    }
  
    let domParentFiber = fiber.parent;
    while (!domParentFiber!.dom) {
      domParentFiber = domParentFiber!.parent;
    }
    const domParent = domParentFiber!.dom!;
  
    if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
      domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
      updateDom(fiber.dom, fiber.alternate!.props, fiber.props);
    } else if (fiber.effectTag === "DELETION") {
      commitDeletion(fiber, domParent);
    }
  
    commitWork(fiber.child!);
    commitWork(fiber.sibling!);
  }
  
  function commitDeletion(fiber: Fiber, domParent: HTMLElement) {
    if (fiber.dom) {
      domParent.removeChild(fiber.dom);
    } else {
      commitDeletion(fiber.child!, domParent);
    }
  }
  
  function render(element: Fiber, container: HTMLElement) {
    // 기존에 추가된 모든 자식 요소들을 제거
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    wipRoot = {
      dom: container,
      props: {
        children: [element],
      },
      alternate: currentRoot!,
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
}
  
  let nextUnitOfWork: Fiber | null = null;
  let currentRoot: Fiber | null = null;
  let wipRoot: Fiber | null = null;
  let deletions: Fiber[] = [];
  
  function workLoop(deadline: IdleDeadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
      shouldYield = deadline.timeRemaining() < 1;
    }
  
    if (!nextUnitOfWork && wipRoot) {
      commitRoot();
    }
  
    requestIdleCallback(workLoop);
  }
  
  requestIdleCallback(workLoop);

  
  
  function performUnitOfWork(fiber: Fiber): Fiber | null {
    const isFunctionComponent = fiber.type instanceof Function;
    if (isFunctionComponent) {
      updateFunctionComponent(fiber);
    } else {
      updateHostComponent(fiber);
    }
    
    if (fiber.child) {
      return fiber.child;
    }
    
    let nextFiber: Fiber | null = fiber;
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.parent;
    }
    
    return null;
  }
  
  let wipFiber: Fiber | null = null;
  let hookIndex: number | null = null;
  
  function updateFunctionComponent(fiber: Fiber) {
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
  }
  
  type StateUpdater<T> = (prevState: T) => T;

  function useState<T>(initial: T): [T, (action: StateUpdater<T>) => void] {
    const oldHook = wipFiber!.alternate && wipFiber!.alternate.hooks && wipFiber!.alternate.hooks[hookIndex!];
    const hook = {
      state: oldHook ? oldHook.state : initial,
      queue: [],
    };
  
    const actions = oldHook ? oldHook.queue : [];
    actions.forEach((action) => {
      hook.state = action(hook.state);
    });
  
    const setState = (action: any) => {
      hook.queue.push(action);
      wipRoot = {
        dom: currentRoot!.dom,
        props: currentRoot!.props,
        alternate: currentRoot!,
      };
      nextUnitOfWork = wipRoot;
      deletions = [];
    };
  
    wipFiber!.hooks.push(hook);
    hookIndex!++;
    return [hook.state, setState];
  }
  
  function updateHostComponent(fiber: Fiber) {
    if (!fiber.dom) {
      fiber.dom = createDom(fiber);
    }

    reconcileChildren(fiber, fiber.props.children);
  }
  
  function reconcileChildren(wipFiber: Fiber, elements: Fiber[]) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling: Fiber | null = null;
  
    while (index < elements.length || oldFiber != null) {
      const element = elements[index];
      let newFiber: Fiber | null = null;
  
      const sameType = oldFiber && element && element.type === oldFiber.type
  
      if (sameType) {
        newFiber = {
          type: oldFiber.type,
          props: element.props,
          dom: oldFiber.dom,
          parent: wipFiber,
          alternate: oldFiber,
          effectTag: "UPDATE",
        };
      }
      if (element && !sameType) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: "PLACEMENT",
        };
      }
      if (oldFiber && !sameType) {
        oldFiber.effectTag = "DELETION";
        deletions.push(oldFiber);
      }
  
      if (oldFiber) {
        oldFiber = oldFiber.sibling;
      }
  
      if (index === 0) {
        wipFiber.child = newFiber;
      } else if (element) {
        prevSibling!.sibling = newFiber;
      }
  
  
      prevSibling = newFiber;
      index++;
    }
  }
  
  
  const Didact = {
    createElement,
    render,
    useState,
  };
  
  export default Didact;
