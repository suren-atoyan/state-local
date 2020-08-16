import { create as createState } from '.';
import { errorMessages } from './validators';

// there are three major parts that should be tested

// 1) the `createState` function itself
// `createState` is a function with two parameters:
// the first one (required) is the initial state and it should be a non-empty object
// the second one (optional) is the handler, which can be function or object
// if the handler is a function then it should be called immediately after every state update
// if the handler is an object then the keys of that object should be a subset of the state
// and all the values of that object should be functions, plus they should be called immediately
// after every update of the corresponding field in the state

describe('createState', () => {
  // test 1 - check if `createState` throws an error when we don't pass an argument
  // check error message
  test('should throw an error when no arguments are passed', () => {
    function callCreateStateWithoutArguments() {
      createState();
    }

    expect(callCreateStateWithoutArguments).toThrow(errorMessages.initialIsRequired);
  });

  // test 2 - check if `createState` throws an error when the first argument is not an object
  // check the error message
  test('should throw an error when the first argument is not an object', () => {
    function callCreateStateWithNonObjectFirstArgument(initial) {
      return () => createState(initial);
    }

    expect(callCreateStateWithNonObjectFirstArgument('string')).toThrow(errorMessages.initialType);
    expect(callCreateStateWithNonObjectFirstArgument([1, 2, 3])).toThrow(errorMessages.initialType);
    expect(callCreateStateWithNonObjectFirstArgument(x => x + 1)).toThrow(errorMessages.initialType);
  });

  // test 3 - check if `createState` throws an error when the first argument is an empty object
  // check the error message
  test('should throw an error when the first argument is an empty object', () => {
    function callCreateStateWithEmptyObjectFirstArgument() {
      createState({});
    }

    expect(callCreateStateWithEmptyObjectFirstArgument).toThrow(errorMessages.initialContent);
  });

  // test 4 - check if `createState` returns a pair of functions when it receives a non-empty object
  test('should return a pair of functions when receives a non-empty object', () => {
    const result = createState({ x: 1, y: 2 });

    expect(result.length).toEqual(2);
    expect(result[0]).toBeInstanceOf(Function);
    expect(result[1]).toBeInstanceOf(Function);
  });

  // test 5 - check if `createState` (with valid first argument) throws an error when the second
  // arguemnt is neither function nor object
  // check the error message
  test('should throw an error when the second argument is neither function nor object', () => {
    function callCreateStateWithWrongSecondArgument(handler) {
      return () => createState({ x: 1, y: 2 }, handler);
    }

    expect(callCreateStateWithWrongSecondArgument('string')).toThrow(errorMessages.handlerType);
    expect(callCreateStateWithWrongSecondArgument([1, 2, 3])).toThrow(errorMessages.handlerType);
  });

  // test 6 - check if `createState` (with valid first argument) throws an error when the second
  // argument is an object but its values are not functions
  test('should throw an error when the second argument is object, but its values are not functions', () => {
    function callCreateStateWithWrongSecondArgument() {
      createState({ x: 1, y: 2 }, {
        x: () => {},
        y: 'not a function',
      });
    }

    expect(callCreateStateWithWrongSecondArgument).toThrow(errorMessages.handlersType);
  });
});

// 2) the `getState`
// `getState` is a function with one optional parameter - selector
// `getState` call without argument will return the current state
// `getState` call with an argument (selector) will return the subset of the current state
// the selector should be a function, which is supposed to receive the current state and return its subset

describe('getState', () => {
  // test 1 - check if `getState` is a function
  test('should be a function', () => {
    const [setState, getState] = createState({ isLoading: true, errorMessages: 'something went wrong' });

    expect(getState).toBeInstanceOf(Function);
  });

  // test 2 - check if `getState` (without arguments) returns the current state
  test('should return the current state when the selector is missing', () => {
    const initialState = { isRendered: false, data: null };
    const [getState, setState] = createState(initialState);

    const currentState = getState();

    // according to the docs of jest - toEqual recursively checks every field of an object or array
    expect(currentState).toEqual(initialState);
  });

  // test 3 - check if `getState` throws an error when
  // the selector (the first argument) is not a function
  // check the error message
  test('should throw an error when the selector is not a function', () => {
    const [getState, setState] = createState({ value: 0 });

    function callGetStateWithNonFunctionSelector(selector) {
      return () => getState(selector);
    }

    expect(callGetStateWithNonFunctionSelector(null)).toThrow(errorMessages.selectorType);
    expect(callGetStateWithNonFunctionSelector('string')).toThrow(errorMessages.selectorType);
    expect(callGetStateWithNonFunctionSelector({})).toThrow(errorMessages.selectorType);
    expect(callGetStateWithNonFunctionSelector(NaN)).toThrow(errorMessages.selectorType);
    expect(callGetStateWithNonFunctionSelector(0)).toThrow(errorMessages.selectorType);
    expect(callGetStateWithNonFunctionSelector('')).toThrow(errorMessages.selectorType);
    expect(callGetStateWithNonFunctionSelector(47)).toThrow(errorMessages.selectorType);
  });

  // test 4 - check if `getState` with the selector returns a subset of the current state as expected
  test('should return a subset of the current state if the selector is provided', () => {
    const [getState, setState] = createState({ x: 0, y: 0, color: '#fff', isActive: false });

    const state = getState(({ x, y }) => ({ x, y }));

    expect(state).toEqual({ x: 0, y: 0 });
    expect(state.color).toBeUndefined();
    expect(state.isActive).toBeUndefined();
  });
});

// 3) `setState`
// `setState` is a function with one required parameter
// which is either an object - presumably the change of the state
// or a function which is supposed to be called with the current state and return a change object
// In both cases the change object should contain only those fields which exist in the initial state
// After `setState` the new state should be accessable from `getState` as expected
// Also, it must be mentioned that if there is a handler or there are handlers, they should be called after each
// or an appropriate change of state correspondingly

describe('setState', () => {
  // test 1 - check if `setState` is a function
  test('should be a function', () => {
    const [getState, setState] = createState({ resolve: null, reject: null });

    expect(setState).toBeInstanceOf(Function);
  });

  // test 2 - check if `setState` throws an error when the argument is neither object nor function
  // check the error message
  test('should throw an error when the argument is neither object nor function', () => {
    const [getState, setState] = createState({ config: {} });

    function callSetStateWithWrongArgument(change) {
      return () => setState(change);
    }

    expect(callSetStateWithWrongArgument(null)).toThrow(errorMessages.changeType);
    expect(callSetStateWithWrongArgument('string')).toThrow(errorMessages.changeType);
    expect(callSetStateWithWrongArgument(NaN)).toThrow(errorMessages.changeType);
    expect(callSetStateWithWrongArgument(0)).toThrow(errorMessages.changeType);
    expect(callSetStateWithWrongArgument('')).toThrow(errorMessages.changeType);
    expect(callSetStateWithWrongArgument(47)).toThrow(errorMessages.changeType);
  });

  // test 3 - check if `setState` throws an error when the change object contains a key which is not from the initial state
  // check the error message
  test('should throw an error when the change object is not compatible with initial state', () => {
    const [getState, setState] = createState({ x: 1, y: 2 });

    function callSetStateWithWrongChangeObject(change) {
      return () => setState(change);
    }

    expect(callSetStateWithWrongChangeObject({ z: 4 })).toThrow(errorMessages.changeField);
    expect(callSetStateWithWrongChangeObject(state => ({ z: 5 }))).toThrow(errorMessages.changeField);
  });

  // test 5 - check if `setState` call updates the current state as expected
  test('should update current state', () => {
    const [getState, setState] = createState({ x: 0, y: 1 });

    setState({ x: 5 });

    const currentState = getState();

    expect(currentState).toEqual({ x: 5, y: 1 });
  });

  // test 6 - check if `setState` call invokes the handler with the latest update
  test('should invoke handler with the latest update', () => {
    const handler = jest.fn();
    const [getState, setState] = createState({ x: 0, y: 1 }, handler);

    setState({ x: 2 });
    setState({ x: 3 });
    setState(state => ({ y: 5 }));

    expect(handler).toHaveBeenNthCalledWith(1, { x: 2, y: 1 });
    expect(handler).toHaveBeenNthCalledWith(2, { x: 3, y: 1 });
    expect(handler).toHaveBeenNthCalledWith(3, { x: 3, y: 5 });
  });

  // test 7 - check if `setState` call invokes handlers with the latest update of the corresponding field
  test('should invoke handlers with the latest update of the corresponding field', () => {
    const handlers = {
      uuid: jest.fn(),
      config: jest.fn(),
      value: jest.fn(),
    };

    const [getState, setState] = createState({
      uuid: '%6^f',
      config: { theme: 'dark' },
      value: 11,
      smth: 'something',
    }, handlers);

    setState({ uuid: 'j**.' });
    setState({ config: { theme: 'light' } });
    setState(state => ({ value: 17 }));

    expect(handlers.uuid).toHaveBeenNthCalledWith(1, 'j**.');
    expect(handlers.config).toHaveBeenNthCalledWith(1, { theme: 'light' });
    expect(handlers.value).toHaveBeenNthCalledWith(1, 17);
  });
});
