<script>
  import { Router, Link, Route } from "svelte-routing";
  import login from "./routes/login.svelte";
  import Home from "./routes/Home.svelte";

  export let url = "";
</script>

<style>
  nav {
    background-color: #696868;
    color: #ddd;
    text-align: center;
  }
  li:hover {
    background-color: #ddd;
  }
  nav li {
    display: inline;
    display: inline-block;
    padding: 10px;
  }
</style>

<Router {url}>
  {#if 1 === 0}
    <nav>
      <ul>
        |
        <!-- svelte-ignore a11y-missing-attribute -->
        <li>
          <Link to="/">Login</Link>
        </li>
        |
        <!-- svelte-ignore a11y-missing-attribute -->
        <li>
          <Link to="login">Login</Link>
        </li>
        |
      </ul>
    </nav>
  {/if}
  <div>
    <Route path="/" component={login} />
    <Route path="/">
      <Home />
    </Route>
  </div>
</Router>
