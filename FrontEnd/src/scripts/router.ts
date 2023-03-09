import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Exercise from "../pages/Exercise.vue";

const enum Urls {
  HOME = "/home",
  LOGIN = "/login",
  ERROR = "/error",
}

const enum Routes {
  HOME = "home",
  LOGIN = "login",
  ERROR = "error",
}

const HomeRoute: RouteRecordRaw = {
  path: Urls.HOME,
  name: Routes.HOME,
  component: Home,
  children: [
    {
      path: "/exercise",
      component: Exercise,
    },
  ],
};

const LoginRoute: RouteRecordRaw = {
  path: Urls.LOGIN,
  name: Routes.LOGIN,
  component: Login,
};

const routes: RouteRecordRaw[] = [HomeRoute, LoginRoute];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export { router, Routes };
