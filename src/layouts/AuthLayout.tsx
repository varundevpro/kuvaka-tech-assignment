import { ModeToggle } from "@/components/mode-toggle";
import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div>
      <div className="fixed top-4 right-2 z-100">
        <ModeToggle />
      </div>
      <Outlet />
    </div>
  );
}
