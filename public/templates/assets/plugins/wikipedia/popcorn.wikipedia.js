(function ( Popcorn ) {

  var allWikiLangLinks, allWikiLangNames,
      cachedArticles = [];

  // shortcut
  function create( type ) {
    return document.createElement( type );
  }

  function getFragment( inputString ) {
    //grabbed from butter util methods
    var range = document.createRange(),
        // For particularly speedy loads, 'body' might not exist yet, so try to use 'head'
        container = document.body || document.head,
        fragment;

    range.selectNode( container );
    fragment = range.createContextualFragment( inputString );

    if( fragment.childNodes.length === 1 ){
      var child = fragment.firstChild;
      fragment.removeChild( child );
      return child;
    }

    return fragment;
  }

  function validateDimension( value, fallback ) {
    if ( typeof value === "number" ) {
      return value;
    }
    return fallback;
  }

  function sanitize( text ) {
    return text.replace( /\(/g, "&lpar;" )
               .replace( /\)/g, "&rpar;" )
               .replace( /-/g, "&hyphen;" )
               .replace( /\s/g, "&nbsp;" )
               .replace( /,/g, "&comma;" )
               .replace( /'/g, "&apos" );
  }

  function areValidElements( element ) {
    while( element && !element.textContent ){
      element = element.nextElementSibling;
      if ( !element || element.nodeName !== "P" ) {
        return false;
      }
    }
    return true;
  }

  function setupWiki( options, instance ) {
    // declare needed variables
    // get a guid to use for the global wikicallback function

    var _title,
        _titleDiv,
        _titleTextArea,
        _mainContentDiv,
        _contentArea,
        _toWikipedia,
        _inner,
        _href,
        _query,
        _guid = Popcorn.guid( "wikiCallback" ),
        _this = instance;

    if ( options._container && options._inner ) {
      options._container.removeChild( options._inner );
    }

    options._inner = _inner = create( "div" );
    _inner.classList.add( "wikipedia-inner-container" );
    var tDirection="ltr";
    console.log("setupwiki rtl is " + options.isRTL);
    var classSuffix=""
    if (options.isRTL) {
      tDirection="rtl";
      classSuffix="-rtl"
    }


    /* create title div, title text area, merge them */
    _titleDiv = create( "div" );
     _titleDiv.classList.add( "wikipedia-title"+classSuffix );
    _titleTextArea = create( "div" );
    _titleTextArea.classList.add( "wikipedia-title-text"+classSuffix );
    _titleTextArea.classList.add( "wikipedia-ellipsis" );
    _titleDiv.appendChild( _titleTextArea );



    /* create main content div, wikipedia content div, merge them */
    _mainContentDiv = create( "div" );
    _mainContentDiv.classList.add( "wikipedia-main-content"+classSuffix );
    _contentArea = create( "div" );
    _contentArea.classList.add( "wikipedia-content"+classSuffix );
    _mainContentDiv.appendChild( _contentArea );

    /* create the toWikipedia div - for the arrow */
    _toWikipedia = create( "a" );
    _toWikipedia.classList.add( "wikipedia-to-wiki"+classSuffix );
    
    _inner.appendChild( _titleDiv );
    _inner.appendChild( _mainContentDiv );
    _inner.appendChild( _toWikipedia );
    _inner.style.direction=tDirection; 

    options._container.appendChild( _inner );
    options._target.appendChild( options._container );

    if ( !options.lang ) {
      options.lang = "en";
    }

    function buildArticle( data ) {
      var childIndex = 1,
          responseFragment = getFragment( "<div>" + data.parse.text + "</div>" ),
          element = responseFragment.querySelector( "div > p:nth-of-type(" + childIndex + ")" ),
          mainText = "";

      _titleTextArea.appendChild( getFragment( "<a href=\"" + options._link + "\" target=\"_blank\">" + sanitize( data.parse.title ) + "</a>" ) );
      _toWikipedia.href = options._link;
      _toWikipedia.onclick = function() {
        _this.media.pause();
      };
      _toWikipedia.setAttribute( "target", "_blank" );

      while ( !areValidElements( element ) ) {
        element = responseFragment.querySelector( "div > p:nth-of-type(" + ( ++childIndex ) + ")" );
      }

      while ( element && element.nodeName === "P" ) {
        mainText += element.textContent + "<br />";
        element = element.nextElementSibling;
      }

      _contentArea.innerHTML = mainText;
    }

    window[ _guid ] = function ( data ) {

      cachedArticles[ _query ] = data;

      if ( data.error ) {
        _titleTextArea.innerHTML = "Article Not Found";
        _contentArea.innerHTML = data.error.info;
        return;
      }

      buildArticle( data );
    };

    if ( options.src ) {

      _query = options.src + options.lang;
      _href = "//" + encodeURI( options.lang ) + ".wikipedia.org/w/";
      _title = options.src.slice( options.src.lastIndexOf( "/" ) + 1 );
      options._link = "//" + encodeURI( options.lang + ".wikipedia.org/wiki/" + _title );

      if ( !cachedArticles[ _query ] ) {
        // gets the mobile format, so that we don't load unwanted images when the respose is turned into a documentFragment
        //var fetchURL=_href + "api.php?action=parse&prop=text&redirects&page=" + window.escape( _title ) + "&noimages=1&mobileformat=html&format=json&callback=" + _guid;
        //POP-214: changed window.escape to encodeURL.  Fixes Arabic.  Arabic search example: الغة_عربية
        var fetchURL=_href + "api.php?action=parse&prop=text&redirects&page=" + encodeURI( _title )  + "&noimages=1&mobileformat=html&format=json&callback=" + _guid;
        console.log("fetching url " + fetchURL);
        Popcorn.getScript( fetchURL );
      } else {
        buildArticle( cachedArticles[ _query ] );
      }
    }
  }

  var WikipediaDefinition = {

    _setup : function( options ) {
      var _outer;

      options._target = Popcorn.dom.find( options.target );

      if ( !options._target ) {
        return;
      }

      options._container = _outer = create( "div" );
      _outer.classList.add( "wikipedia-outer-container" );
      _outer.classList.add( options.transition );
      _outer.classList.add( "off" );



      _outer.style.width = validateDimension( options.width, "100" ) + "%";
      _outer.style.height = validateDimension( options.height, "100" ) + "%";
      _outer.style.top = validateDimension( options.top, "0" ) + "%";
      _outer.style.left = validateDimension( options.left, "0" ) + "%";
      _outer.style.zIndex = +options.zindex;

      setupWiki( options, this );

      options.toString = function() {
        return options.src || options._natives.manifest.options.src[ "default" ];
      };
    },

    start: function( event, options ){
      var container = options._container,
          redrawBug;

      if ( container ) {
        container.classList.add( "on" );
        container.classList.remove( "off" );

        // Safari Redraw hack - #3066
        container.style.display = "none";
        redrawBug = container.offsetHeight;
        container.style.display = "";
      }
    },

    end: function( event, options ){
      if ( options._container ) {
        options._container.classList.add( "off" );
        options._container.classList.remove( "on" );
      }
    },

    _teardown: function( options ){
      if ( options._target && options._container ) {
        options._target.removeChild( options._container );
      }
    },

    _update: function( trackEvent, options ) {

      if ( options.transition && options.transition !== trackEvent.transition ) {
        trackEvent._container.classList.remove( trackEvent.transition );
        trackEvent.transition = options.transition;
        trackEvent._container.classList.add( trackEvent.transition );
      }

      if ( options.src && options.src !== trackEvent.src ) {
        trackEvent.src = options.src;
        setupWiki( trackEvent, this );
      }

      if ( options.lang && options.lang !== trackEvent.lang ) {
        trackEvent.lang = options.lang;
        setupWiki( trackEvent, this );
      }

      if ( options.top && options.top !== trackEvent.top ) {
        trackEvent.top = options.top;
        trackEvent._container.style.top = trackEvent.top + "%";
      }

      if ( options.left && options.left !== trackEvent.left ) {
        trackEvent.left = options.left;
        trackEvent._container.style.left = trackEvent.left + "%";
      }

      if ( options.width && options.width !== trackEvent.width ) {
        trackEvent.width = options.width;
        trackEvent._container.style.width = trackEvent.width + "%";
      }

      if ( options.height && options.height !== trackEvent.height ) {
        trackEvent.height = options.height;
        trackEvent._container.style.height = trackEvent.height + "%";
      }
      //var newInfoWindowOpen = ("infoWindowOpen" in options); 
      
      if ("isRTL" in options) {
          trackEvent.isRTL = options.isRTL;
          setupWiki( trackEvent, this );         
      }
    }
  };

  // Language codes: http://stats.wikimedia.org/EN/TablesDatabaseWikiLinks.htm
  allWikiLangLinks=("ab,ace,af,ak,sq,als,am,ang,ar,is,arc,oc,roa-rup,frp,as,ast,av,ay,az,bm,bjn,ba,eu,bar,arz,an,bh,bpy,bi,bs,cy,bug,bg,my,bxr,zh_yue,csb,ca,ceb,bcl,ch,ce,chr,chy,y,zh,cv,kw,co,cr,crh,hr,cs,da,dv,nl,dz,mhr,hy,eml,en,myv,eo,et,ee,ext,fo,hif,fj,fi,fr,fy,fur,ff,gl,gan,lg,ka,de,glk,got,el,kl,gn,gu,ht,hak,ha,haw,he,hi,hu,br,io,ig,ilo,id,ia,ie,iu,ik,ga,it,ja,jv,kab,xal,kn,pam,krc,kaa,kbd,ks,kk,km,ki,rw,ky,rn,kv,koi,kg,ko,ku,lad,lbe,lo,ltg,la,lv,lez,lij,li,ln,lt,jbo,lmo,nds,dsb,lb,mk,mg,ms,ml,mt,gv,mi,mr,mzn,cdo,zh-min-nan,mwl,mdf,mn,nah,na,nv,nap,new,ne,pih,nrm,frr,se,nso,no,nov,nn,war,cu,or,om,os,pi,pag,pap,ps,pdc,fa,pcd,pms,pl,pnt,pt,pa,qu,ksh,rmy,ro,rm,ru,rue,sah,sm,sg,sa,sc,stq,sco,gd,sr,sh,st,tn,sn,scn,szl,simple,sd,si,ss,sk,sl,so,ckb,es,srn,su,sw,sv,tl,ty,tg,ta,tt,te,tet,th,bo,ti,tpi,to,ts,tum,tr,tk,tw,udm,uk,hsb,ur,ug,uz,ve,vec,vep,vi,vo,fiu-vro,wa,bn,be,vls,mrj,pnb,wo,wuu,xh,yi,yo,diq,zea,za,zu").split(",");                          
  allWikiLangNames=("Abkhazian,Acehnese,Afrikaans,Akan,Albanian,Alemannic,Amharic,Anglo Saxon,Arabic,Aragonese,Aramaic,Armenian,Aromanian,Arpitan,Assamese,Asturian,Avar,Aymara,Azeri,Bambara,Banjar,Bashkir,Basque,Bavarian,Belarusian,Bengali,Bihari,Bishnupriya Manipuri,Bislama,Bosnian,Breton,Buginese,Bulgarian,Burmese,Buryat,Cantonese,Cassubian,Catalan,Cebuano,Central Bicolano,Chamorro,Chechen,Cherokee,Cheyenne,Chichewa,Chinese,Chuvash,Cornish,Corsican,Cree,Crimean Tatar,Croatian,Czech,Danish,Divehi,Dutch,Dzongkha,Eastern Mari,Egyptian Arabic,Emilian-Romagnol,English,Erzya,Esperanto,Estonian,Ewe,Extremaduran,Faroese,Fiji Hindi,Fijian,Finnish,French,Frisian,Friulian,Fulfulde,Galician,Gan,Ganda,Georgian,German,Gilaki,Gothic,Greek,Greenlandic,Guarani,Gujarati,Haitian,Hakka,Hausa,Hawai'ian,Hebrew,Hindi,Hungarian,Icelandic,Ido,Igbo,Ilokano,Indonesian,Interlingua,Interlingue,Inuktitut,Inupiak,Irish,Italian,Japanese,Javanese,Kabyle,Kalmyk,Kannada,Kapampangan,Karachay-Balkar,Karakalpak,Karbadian,Kashmiri,Kazakh,Khmer,Kikuyu,Kinyarwanda,Kirghiz,Kirundi,Komi,Komi Permyak,Kongo,Korean,Kurdish,Ladino,Lak,Laotian,Latgalian,Latin,Latvian,Lezgian,Ligurian,Limburgish,Lingala,Lithuanian,Lojban,Lombard,Low Saxon,Lower Sorbian,Luxembourgish,Macedonian,Malagasy,Malay,Malayalam,Maltese,Manx,Maori,Marathi,Mazandarani,Min Dong,Min Nan,Mirandese,Moksha,Mongolian,Nahuatl,Nauruan,Navajo,Neapolitan,Nepal Bhasa,Nepali,Norfolk,Norman,North Frisian,Northern Sami,Northern Sotho,Norwegian,Novial,Nynorsk,Occitan,Old Church Slavonic,Oriya,Oromo,Ossetic,Pali,Pangasinan,Papiamentu,Pashto,Pennsylvania German,Persian,Picard,Piedmontese,Polish,Pontic,Portuguese,Punjabi,Quechua,Ripuarian,Romani,Romanian,Romansh,Russian,Rusyn,Sakha,Samoan,Sangro,Sanskrit,Sardinian,Saterland Frisian,Scots,Scots Gaelic,Serbian,Serbo-Croatian,Sesotho,Setswana,Shona,Sicilian,Silesian,Simple English,Sindhi,Sinhala,Siswati,Slovak,Slovene,Somali,Sorani,Spanish,Sranan,Sundanese,Swahili,Swedish,Tagalog,Tahitian,Tajik,Tamil,Tatar,Telugu,Tetum,Thai,Tibetan,Tigrinya,Tok Pisin,Tongan,Tsonga,Tumbuka,Turkish,Turkmen,Twi,Udmurt,Ukrainian,Upper Sorbian,Urdu,Uyghur,Uzbek,Venda,Venetian,Vepsian,Vietnamese,Volapuk,Voro,Walloon,Waray-Waray,Welsh,West Flemish,Western Mari,Western Panjabi,Wolof,Wu,Xhosa,Yiddish,Yoruba,Zazaki,Zealandic,Zhuang,Zulu").split(",");

  Popcorn.plugin( "wikipedia", WikipediaDefinition, {
    about:{
      name: "Popcorn Wikipedia Plugin",
      version: "0.1",
      author: "@ChrisDeCairos",
      website: "https://chrisdecairos.ca/"
    },
    options:{
      start: {
        elem: "input",
        type: "text",
        label: "Start",
        "units": "seconds"
      },
      end: {
        elem: "input",
        type: "text",
        label: "End",
        "units": "seconds"
      },
      lang: {
        elem: "select",
        options: allWikiLangNames,
        values: allWikiLangLinks,
        label: "Language",
        "default": "en"
      },
      src: {
        elem: "input",
        type: "text",
        label: "Article Link/Title",
        "default": "Popcorn.js"
      },

      top: {
        elem: "input",
        type: "number",
        label: "Top",
        "default": 25,
        "units": "%",
        "hidden": false,
        group: "advanced"
      },
      left: {
        elem: "input",
        type: "number",
        label: "Left",
        "default": 30,
        "units": "%",
        "hidden": false,
        group: "advanced"
      },
      width: {
          elem: "input",
          type: "number",
          label: "Width",
          "default": 40,
          "units": "%",
          group: "advanced"
        },
        height: {
          elem: "input",
          type: "number",
          label: "Height",
          "default": 50,
          "units": "%",
          group: "advanced"
        },
        isRTL: {
          elem: "input",
          type: "checkbox",
          label: "Right to Left Text",
          group:"advanced",
          "default": false,
          optional: true
        },  
      target: {
        hidden: true
      },
      transition: {
        elem: "select",
        options: [ "None", "Pop", "Fade", "Slide Up", "Slide Down" ],
        values: [ "popcorn-none", "popcorn-pop", "popcorn-fade", "popcorn-slide-up", "popcorn-slide-down" ],
        label: "Transition",
        "default": "popcorn-fade",
          group: "advanced"
      },
      zindex: {
        hidden: true
      }
    }
  });

}( Popcorn ));
