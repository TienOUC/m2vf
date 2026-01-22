interface FormSuccessMessageProps {
  message: string;
}

export function FormSuccessMessage({ message }: FormSuccessMessageProps) {
  return (
    <div className="p-4 rounded-xl bg-success/10 border border-success/20">
      <p className="text-sm text-success-foreground text-center">{message}</p>
    </div>
  );
}
