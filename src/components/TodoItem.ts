import Didact from '../CustomReact';

type Todo = {
  id: number;
  content: string;
  completed: boolean;
};

type TodoItemProps = {
  todo: Todo;
  onToggleTodo: (id: number) => void;
  onDeleteTodo: (id: number) => void;
};

const TodoItem = ({ todo, onToggleTodo, onDeleteTodo }: TodoItemProps) => {
  const handleToggle = () => {
    onToggleTodo?.(todo.id);
  };

  const handleDelete = () => {
    onDeleteTodo?.(todo.id);
  };

  return Didact.createElement(
    'li',
    {},
    Didact.createElement('span', {}, todo.content),
    Didact.createElement('button', { onClick: handleToggle }, 'Toggle'),
    Didact.createElement('button', { onClick: handleDelete }, 'Delete')
  );
};

export default TodoItem;