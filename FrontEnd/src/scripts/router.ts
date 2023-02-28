import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomePage from "../Pages/Home.vue";
import LoginPage from "../Pages/Login.vue";

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

const AllToHome = {
  path: "/",
  redirect: "/login",
};

const HomeRoute: RouteRecordRaw = {
  path: Urls.HOME,
  name: Routes.HOME,
  component: HomePage,
};

const LoginRoute: RouteRecordRaw = {
  path: Urls.LOGIN,
  name: Routes.LOGIN,
  component: LoginPage,
};

const routes: RouteRecordRaw[] = [HomeRoute, LoginRoute, AllToHome];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export { router, Routes };
