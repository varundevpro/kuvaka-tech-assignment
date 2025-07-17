# Kuvaka Tech Frontend Assignment

## Live Link

[http://kuvaka-tech-assignment-five.vercel.app](http://kuvaka-tech-assignment-five.vercel.app/)

## Pre-requisites

- Node v22.10.0
- Npm v10.9.0

## Setup and run instructions

To run the app locally, first install dependencies by running the following commands in terminal.

```
npm install
```

Then run the local dev server

```
npm run dev
```

The visit [http://localhost:5173](http://localhost:5173) or the URL that's shown in the terminal

## Folder/component structure explanation

### Folder Structure

- **`src/app`**: Contains core application setup, including Redux store configuration (`store.ts`) and custom hooks for interacting with the Redux store (`hooks.ts`).
- **`src/components`**: Houses reusable UI components used across the application.
  - **`src/components/ui`**: Specifically for Shadcn UI components that have been customized or extended.
- **`src/data`**: Stores static or mock data used within the application, such as `chat.ts`.
- **`src/features`**: Organizes application logic by feature, following the Redux Ducks pattern. Each subfolder represents a distinct feature (e.g., `auth`, `chatRooms`, `countries`) and typically contains its Redux slice (`slice.ts`).
- **`src/layouts`**: Defines the main layout components of the application, like `AuthLayout.tsx` and `RootLayout.tsx`, which structure the overall page presentation.
- **`src/lib`**: Includes utility functions or helper modules that are generally independent of React components, like `utils.ts` (potentially for general utility functions).
- **`src/pages`**: Contains top-level components that represent distinct pages or views in the application (e.g., `Login.tsx`, `Dashboard.tsx`).
- **`src/utils`**: Provides a collection of small, focused utility functions that can be used throughout the application, such as date formatting (`date.ts`), class name concatenation (`cn.tsx`), asynchronous delays (`sleep.ts`), and AI assistant-related utilities (`assistant.ts`).

---

### Component Structure

You can find the components in `components` folder:

- **`logout.tsx`**: Handles user logout functionality.
- **`mode-toggle.tsx`**: Provides a UI for switching between light and dark themes.
- **`theme-provider.tsx`**: Context provider for managing the application's theme.
- **`ui`**:
  - **`avatar.tsx`**: Displays user avatars.
  - **`button.tsx`**: Reusable button component.
  - **`chat-container.tsx`**: Likely a wrapper for chat-related UI elements.
  - **`code-block.tsx`**: Component for displaying formatted code snippets.
  - **`dropdown-menu.tsx`**: Provides a dropdown menu interface.
  - **`file-upload.tsx`**: Handles file upload interactions.
  - **`input.tsx`**: Reusable input field.
  - **`loader.tsx`**: Displays loading indicators.
  - **`markdown.tsx`**: Renders markdown content.
  - **`message.tsx`**: Displays individual chat messages.
  - **`prompt-input.tsx`**: Input field specifically for user prompts in a chat.
  - **`scroll-button.tsx`**: Button for scrolling within a container.
  - **`sonner.tsx`**: Notification/toast component.
  - **`textarea.tsx`**: Reusable textarea component.
  - **`tooltip.tsx`**: Displays informative tooltips on hover.

## How throttling, pagination, infinite scroll, and form validation are implemented

**Throttling:** Implemented using a utility function (potentially in src/utils) that limits how often a function can be called. This function would typically use a setTimeout to only execute the wrapped function after a certain delay has passed since the last execution, preventing rapid, repeated calls to expensive operations like API requests.

**Form Validation:** Handled comprehensively using React Hook Form and Zod. Zod schemas define the validation rules for form inputs. These schemas are then integrated with React Hook Form, which manages form state, input registration, and applies the Zod validation rules on submission or input change, displaying error messages to the user.

## Screenshots

<img width="1438" height="690" alt="image" src="https://github.com/user-attachments/assets/47ba31c0-eabe-40cc-bf9a-df8fe60fac03" />

<img width="1437" height="689" alt="image" src="https://github.com/user-attachments/assets/718e413c-e4f6-4448-8a77-88bb4033adcd" />

<img width="1440" height="699" alt="image" src="https://github.com/user-attachments/assets/7f81ade0-3521-4e58-b5f4-8ae45abcfb27" />
