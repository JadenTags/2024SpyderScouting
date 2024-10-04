import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import LogInView from "@/views/LogInView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "LogIn",
      component: LogInView,
      meta: { title: "Log In | Team Spyder Scouting" },
    },
    {
      path: "/home",
      name: "Home",
      component: () => import("@/views/HomeView.vue"),
      meta: {
        title: "Home | Team Spyder Scouting",
        protected: true,
      },
    },
    {
      path: "/forms/pit",
      name: "Pit Form",
      component: () => import("@/views/formsViews/PitFormView.vue"),
      meta: {
        title: "Pit Form | Team Spyder Scouting",
        protected: true,
      },
    },
    {
      path: "/forms/match",
      name: "Match Form",
      component: () => import("@/views/formsViews/MatchFormView.vue"),
      meta: {
        title: "Match Form | Team Spyder Scouting",
        protected: true,
      },
    },
    {
      path: "/displays/teamSearch",
      name: "Team Search Display",
      component: () => import("@/views/displayViews/TeamSearchView.vue"),
      meta: {
        title: "Team Search Display | Team Spyder Scouting",
        protected: true,
      },
    },
    {
      path: "/displays/multiSearch",
      name: "Multi Search Display",
      component: () => import("@/views/displayViews/MultiSearchView.vue"),
      meta: {
        title: "Multi Search Display | Team Spyder Scouting",
        protected: true,
      },
    },
    {
      path: "/displays/matchSearch",
      name: "Match Search Display",
      component: () => import("@/views/displayViews/MatchSearchView.vue"),
      meta: {
        title: "Match Search Display | Team Spyder Scouting",
        protected: true,
      },
    },
    {
      path: "/displays/formSearch",
      name: "Form Search Display",
      component: () => import("@/views/displayViews/FormSearchView.vue"),
      meta: {
        title: "Form Search Display | Team Spyder Scouting",
        protected: true,
      },
    },
    {
      path: "/picklisting/teamSort",
      name: "Picklisting Team Sort",
      component: () => import("@/views/picklistingViews/teamSortView.vue"),
      meta: {
        title: "Team Sort | Team Spyder Scouting",
        protected: true,
      },
    },
    {
      path: "/:catchAll(.*)",
      name: "NotFound",
      component: () => import("@/views/404.vue"),
      meta: {
        title: "Whoops! | Team Spyder Scouting",
        protected: false,
      }
    }
    // {
    //   path: "/about",
    //   name: "about",
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   // component: () => import("@/views/AboutView.vue"),
    // },
  ],
});

router.afterEach((to) => {
  document.title = to.meta.title;
});

//////////
//////////// UNCOMMENT BELOW TO ENABLE LOGIN PROTECTION
//////////
router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  if (to.meta.protected && !authStore.isLoggedIn) {
    return "/";
  } else return;
});

export default router;
