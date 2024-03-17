// Activate nav bg on scroll

  $(document).ready(function() {
    $(window).scroll(function () {
      if ($(window).scrollTop() >= 50) {
        $('.nav_bg').css("opacity", "100%");
      } else {
        $('.nav_bg').css("opacity", "0%");
      }
    });
  });

// Calendly popup code - add the UTM params found in the cookie from the first user session rather than the latest UTM params from a campaign they may have clicked after

  $(document).ready(function () {
    // Function to get a cookie's value by name
    function getCookie(name) {
      let nameEQ = name + '=';
      let ca = document.cookie.split(';');
      for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
      }
      return null;
    }

    // Function to append UTM parameters from cookies to a URL
    function appendUTMParametersFromCookies(url) {
      const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
      let urlObj = new URL(url);
      utmKeys.forEach(key => {
        const cookieValue = getCookie(key);
        if (cookieValue) { // Only append if the cookie exists
          urlObj.searchParams.set(key, cookieValue);
        }
      });
      return urlObj.toString();
    }

    // Add a click event to elements with the wup-link attribute
    $('[wup-link]').on('click', function (event) {
      // Prevent the default link behavior
      event.preventDefault();

      // Get the final URL with UTM parameters from cookies
      const calendlyUrlWithUTM = appendUTMParametersFromCookies('https://calendly.com/therahive-admissions-team/therahive-admissions-team-interview?text_color=2d3d4b&primary_color=e79f1f');

      // Execute the Calendly function with the updated URL
      Calendly.initPopupWidget({
        url: calendlyUrlWithUTM
      });
    });
  });


// places a cookie with the first UTM params detected and will not replace with new UTM params - the code below this places a cookie from the UTM params and also checks if one is already set as to not overwrite it


function getUTMParameters() {
  const params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
    params[key] = value;
  });
  console.log("UTM Parameters captured:", params);
  return params;
}

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
  console.log(`Cookie set: ${name}=${value}; Expires in: ${days} days`);
}

function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) == 0) {
      console.log(`Cookie found: ${name}=${c.substring(nameEQ.length,c.length)}`);
      return c.substring(nameEQ.length,c.length);
    }
  }
  console.log(`Cookie not found: ${name}`);
  return null;
}

if (window.location.search.includes('utm_') || window.location.search.includes('gclid')) {
  console.log("UTM Parameters or gclid found in URL, checking before saving to cookies.");
  const utmParams = getUTMParameters();

  // Ignore utm_content from the URL parameters entirely, focus only on gclid for utm_content cookie
  if (utmParams['gclid']) {
    // Set gclid as the value for utm_content cookie
    setCookie('utm_content', utmParams['gclid'], 30);
  }

  // Save other UTM parameters except utm_content
  Object.keys(utmParams).forEach(param => {
    if (!param.startsWith('utm_content') && param.startsWith('utm_') && !getCookie(param)) {
      setCookie(param, utmParams[param], 30);
    }
  });
}

function appendUTMParameters(url) {
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  let urlObj = new URL(url, window.location.href);
  let urlParams = urlObj.searchParams;

  utmKeys.forEach(key => {
    const cookieValue = getCookie(key);
    if (cookieValue && !urlParams.has(key)) {
      urlParams.set(key, cookieValue);
    }
  });

  return urlObj.toString();
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM fully loaded. Modifying internal links to include UTM parameters.");
  const internalLinks = document.querySelectorAll("a[href^='/'], a[href^='" + window.location.origin + "']");

  internalLinks.forEach(link => {
    const originalHref = link.href;
    link.href = appendUTMParameters(link.href);
    console.log(`Internal link modified: ${originalHref} => ${link.href}`);
  });

  let currentUrl = window.location.href;
  let updatedUrl = appendUTMParameters(currentUrl);
  if (currentUrl !== updatedUrl) {
    console.log(`Updating page URL with UTM parameters: ${updatedUrl}`);
    window.history.replaceState({}, '', updatedUrl);
  }
});