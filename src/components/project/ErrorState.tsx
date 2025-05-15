
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ErrorStateProps {
  error: string;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="text-center py-12 bg-red-50 rounded-lg">
      <p className="text-red-500">{error}</p>
      <Button className="mt-4" variant="outline" asChild>
        <Link to="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
};
