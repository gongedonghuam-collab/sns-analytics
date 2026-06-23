import { createApp } from "vue";
import { createPinia } from "pinia"; // ←追加
import "./style.css";
import App from "./App.vue";

const pinia = createPinia(); // ←追加
const app = createApp(App);

app.use(pinia); // ←追加
app.mount("#app");
