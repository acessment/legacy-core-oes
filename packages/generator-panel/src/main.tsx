
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './page/App.tsx'
import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import { MantineProvider } from "@mantine/core";


createRoot(document.getElementById('root')!).render(
    <MantineProvider>
        <App />
    </MantineProvider>
)
