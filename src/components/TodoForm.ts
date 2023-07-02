import Didact from '../CustomReact';

type TodoFormProps = {
  onAddTodo: (content: string) => void;
};

const TodoForm = ({ onAddTodo }) => {
  const [inputValue, setInputValue] = Didact.useState<string>('');

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setInputValue((prev) => prev === target.value ? prev : target.value);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      onAddTodo?.(inputValue.trim());
      setInputValue(() => '');
    }
  };

  return Didact.createElement(
    'form',
    { onSubmit: handleSubmit },
    Didact.createElement('input', {
      type: 'text',
      value: inputValue,
      onInput: handleInputChange,
      placeholder: 'Enter a new todo item',
    }),
    Didact.createElement('button', { type: 'submit' }, 'Add')
  );
};

export default TodoForm;