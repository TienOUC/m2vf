interface FormSuccessMessageProps {
  message: string;
}

export function FormSuccessMessage({ message }: FormSuccessMessageProps) {
  return (
    <div className="p-4 rounded-xl bg-success-50 border border-success-200">
      <p className="text-sm text-success-700 text-center">{message}</p>
    </div>
  );
}
