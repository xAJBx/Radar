<script>
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
  let instrument = "";
  let instruments = [];
  let instrument_value = [];
  let instvals = [];
  let instrument_display = [];


  ///gravatar
  function get_gravatar(email, size) {

// MD5 (Message-Digest Algorithm) by WebToolkit
// 

var MD5=function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()};

var size = size || 80;

return 'http://www.gravatar.com/avatar/' + MD5(email) + '.jpg?s=' + size;
}

  ///end gravatar

  //@desc:  hits Harbor to validate credintials.  with valid credintials sends token to get user. with user gets profile
  function login(username, password) {
    // get auth token
    console.log(username, password);
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
      //"https://cors-anywhere.herokuapp.com/" +
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
          //"https://cors-anywhere.herokuapp.com/" +
            "http://bridgesautomation.duckdns.org:5778/profile/me",
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            profile = result;
            instruments = get_All_instrumentdata(profile);
          })
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
          //"https://cors-anywhere.herokuapp.com/" +
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
      //"https://cors-anywhere.herokuapp.com/" +
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
      //"https://cors-anywhere.herokuapp.com/" +
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
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("x-auth-token", token);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      //"https://cors-anywhere.herokuapp.com/" +
        "http://bridgesautomation.duckdns.org:5778/profile/settings/genKey",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        alert(JSON.stringify(result));
      })
      .catch((error) => console.log("error", error));
  };

  // HERE ... need to get values updated on page
  setInterval(() => {
    try {
      function get_data(unit_id_d) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("x-auth-token", result.token);

        var requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        };

        //working need to loop an pass unit_id
        fetch(
          //"https://cors-anywhere.herokuapp.com/" +
            `http://bridgesautomation.duckdns.org:5778/data/latestRecord/${unit_id_d}`,
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            instrument = result;
            
            //console.log(instruments.includes(instrument[1][0].unit_id.trim())) // false
            //console.log(instrument[1][0].unit_id); // 1, 2, unit_id
            //console.log(instruments.includes("1"))
            const fu =  instruments.includes(instrument[1][0].unit_id.trim())
            //console.log("instrument: ", instrument[1][0].unit_id.trim())
            //console.log('fu: ', fu)
            //console.log('object: ', instrument[1][0])
            //debugger;
            if(fu){
              let flag = false;
              for(let i = 0; i < instrument_display.length; i++){
                if(instrument_display[i].unit_id.trim() === instrument[1][0].unit_id.trim()){
                  instrument_display[i] = instrument[1][0];
                  flag = true;
                }
              }
              if(!flag){
                instrument_display.unshift(instrument[1][0]);
                flag = false;
              }
              console.log(instrument_display);
              //instrument_display.unshift(instruments[1][0]);
              //console.log("inhere");
              //console.log(instrument_display)

            }else{
              

            }
            //console.log(instrument[1][0].unit_id);
            //console.log(instrument_display);
            //console.log(instruments)

            //if(instrument_display.includes(instrument[1]))
            
            
          })
          .catch((error) => console.log("error", error));
      }
      //hereeeee
      for(let i = 0; i < profile.instruments.length; i++){
        //console.log(profile.instruments);
        get_data(profile.instruments[i]);
      }
    } catch (err) {
      console.error(err.message);
    }
    /*if (result) {
      for (let i = 0; i < instruments.length; i++) {
        //get_instrumentdata(result.token, instruments[i])
        //.then((res) => instrument_value[i] = res.json());
        //console.log(instruments[i]);

        async function doit() {
          console.log("doit");
          instvals[i] = await get_instrumentdata;
          return instvals;
        }
        let tada = doit();
        console.log(tada);
      }
    }*/
  }, 5000);

  // instruments
  //let value = (unit_id) => {
  //    get_instrumentdata(result.token, unit_id);
  //};

  const get_All_instrumentdata = (profile) => {
    return profile.instruments;
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
    <img src={get_gravatar(user.email, 100)} />
    <h1>{user.name}'s Profile</h1>
    <p1>Email: {user.email}</p1>
    <br/>
    <p2>Company: {profile.company}</p2>
    <br/>
    <br/>
    <p1>Need an API key?  Click here ==></p1><button type="button" on:click={API_Key_Gen(result.token)}>API Key Generator</button>


    <br/>
    <h3>Instruments</h3>
    <instrumentsss>
      {#if result}
        {#each instrument_display as obj}
          <li>{obj.time_stamp}---{obj.unit_id}: {obj.sensor_reading}</li>
        {/each}
      {/if}
    </instrumentsss>
  </section>
{/if}
