<script>
  import { navigate } from "svelte-routing";
  let password = "";
  let username = "";
  let result = null;
  let user = null;
  let profile = null;
  let login_visi = true;
  let sign_up = false;
  let reg_email = "";
  let reg_passwrd = "";
  let reg_passwrd_confirm = "";
  let reg_username = "";
  let reg_company = "";

  //@desc:  hits Harbor to validate credintials.  with valid credintials sends token to get user. with user gets profile
  function login(username, password) {
    // get auth token
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ email: `${username}`, password: `${password}` });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "https://cors-anywhere.herokuapp.com/" +
        "http://bridgesautomation.duckdns.org:5778/auth",
      requestOptions
    )
      .then((response) => response.json())
      .then((res) => {
        result = res;

        //send token auth token to get profile
        var myHeaders = new Headers();
        myHeaders.append("x-auth-token", `${result.token}`);

        var requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        };

        fetch(
          "https://cors-anywhere.herokuapp.com/" +
            "bridgesautomation.duckdns.org:5778/profile/me",
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => (profile = result))
          .catch((error) => console.log("error", error));

        //send token auth token to get user
        var myHeaders = new Headers();
        myHeaders.append("x-auth-token", `${result.token}`);

        var requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        };

        fetch(
          "https://cors-anywhere.herokuapp.com/" +
            "http://bridgesautomation.duckdns.org:5778/auth",
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            user = result;

            //navigate to users homepage
            //if(user) navigate("/Home", {replace: true});
            // Transition to homepage
            login_visi = false;
          })
          .catch((error) => console.log("error", error));
      })
      .catch((error) => console.log("error", error));
  }

  // navigate to the signup markup
  const signup = () => {
    sign_up = true;
  };

  // Profile Create
  const profile_create = (token, company) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("x-auth-token", token);

    var raw = JSON.stringify({ company });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "https://cors-anywhere.herokuapp.com/" +
        "http://bridgesautomation.duckdns.org:5778/profile",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log(JSON.stringify(result));
        sign_up = false;
        login(reg_email, reg_passwrd);
      })
      .catch((error) => console.log("error", error));
  };

  // register
  const register = (
    reg_username,
    reg_email,
    reg_passwrd,
    reg_passwrd_confirm
  ) => {
    if (reg_passwrd != reg_passwrd_confirm) {
      return { msg: "Passwords did not match" };
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      name: reg_username,
      email: reg_email,
      password: reg_passwrd,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "https://cors-anywhere.herokuapp.com/" +
        "http://bridgesautomation.duckdns.org:5778/users",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        console.log(JSON.stringify(result));
        profile_create(result.token, reg_company);
      })
      .catch((error) => console.log("error", error));
  };

  const API_Key_Gen = (token) => {
	var myHeaders = new Headers();
    myHeaders.append("Conte", "application/json");
    myHeaders.append("x-auth-token", token);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      "https://cors-anywhere.herokuapp.com/" +
        "http://bridgesautomation.duckdns.org:5778/profile/settings/genKey",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
		  alert(JSON.stringify(result))
		})
      .catch((error) => console.log("error", error));
  };
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }
  section {
    background-color: lightgray;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  p {
    font-size: x-small;
  }
</style>

{#if login_visi && !sign_up}
  <section>
    <main>
      <h1><img src="/img/MyOPC_200x200.png" alt="MyOPC" /></h1>

      <form on:submit|preventDefault={login(username, password)}>
        <label> Username <input required bind:value={username} /> </label>
        <label>
          Password
          <input type="password" required bind:value={password} />
        </label>
        <div class="buttons">
          <button>Login</button>
          <button type="button" on:click={signup}>Sign Up</button>
        </div>
        <p>
          Powered by
          <img
            src="/img/small_BA_logo_75x75_Cropped.png"
            alt="BRIDGES AUTOMATION" />
        </p>
      </form>
    </main>
  </section>
{:else if sign_up}
  <section>
    <main>
      <h1><img src="/img/MyOPC_200x200.png" alt="MyOPC" /></h1>

      <form
        on:submit|preventDefault={register(reg_username, reg_email, reg_passwrd, reg_passwrd_confirm)}>
        <label> Username <input required bind:value={reg_username} /> </label>
        <label> Email <input required bind:value={reg_email} /> </label>
        <label> Company <input required bind:value={reg_company} /> </label>
        <label>
          Password
          <input type="password" required bind:value={reg_passwrd} />
        </label>
        <label>
          Confirm
          <input type="password" required bind:value={reg_passwrd_confirm} />
        </label>
        <div class="buttons"><button>Login</button></div>
        <p>
          Powered by
          <img
            src="/img/small_BA_logo_75x75_Cropped.png"
            alt="BRIDGES AUTOMATION" />
        </p>
      </form>
    </main>
  </section>
{:else}
  <section>
    <h1>{JSON.stringify(user)}</h1>
    <p>{JSON.stringify(profile)}</p>

    
    <button type="button" on:click={API_Key_Gen(result.token)}>API Key Generator</button>
  </section>
{/if}
