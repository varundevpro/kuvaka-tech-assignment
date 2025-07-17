import { useAppSelector } from "@/app/hooks";
import { Loader } from "@/components/ui/loader";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chatrooms"); // Redirect if not authenticated
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <div className="flex min-h-svh w-full justify-center p-6 py-8 md:p-10">
        <div className="w-full max-w-sm flex justify-center items-center">
          <Loader size="lg" variant="circular" />
        </div>
      </div>
    </>
  );
}
