'use strict';

/**
 * Site configuration and delivery parameters for Dastarkhan Restaurant.
 */
const SITE = Object.freeze({
  deliveryFee: 1000,
  freeDeliveryThreshold: 10000,
  minOrder: 3000,
  workHours: Object.freeze({ open: '11:00', close: '23:00' }),
  prepMinutes: 60
});

/**
 * Complete catalog of all 61 dishes from menu.html.
 */
const menuItems = Object.freeze([
  { id: "fried-boso-lagman-with-tomato", name: "Fried Boso Lagman with Tomato", category: "lagmans", meat: "beef", weight: 400, price: 2890, ingredients: "Beef, vegetables, and noodles quickly stir-fried with tomato paste", image: "images/lagman/zhar_lagman_boso_tomat.jpeg" },
  { id: "fried-boso-lagman-with-soy-sauce", name: "Fried Boso Lagman with Soy Sauce", category: "lagmans", meat: "beef", weight: 400, price: 2890, ingredients: "Beef, vegetables, and noodles quickly stir-fried with soy sauce", image: "images/lagman/zhar_lagman_boso_coya.jpeg" },
  { id: "kuldzha-lagman", name: "Kuldzha Lagman", category: "lagmans", meat: "mutton", weight: 450, price: 2990, ingredients: "Mutton lagman with two types of gravy (egg and wild leek/jusai)", image: "images/lagman/lagman_kuldzhinskii.jpeg" },
  { id: "guiru-lagman", name: "Guiru Lagman", category: "lagmans", meat: "beef", weight: 450, price: 2890, ingredients: "Beef, noodles, and coarsely chopped vegetables served separately", image: "images/lagman/guiru_lagman.jpeg" },
  { id: "guiru-ganfan", name: "Guiru Ganfan", category: "lagmans", meat: "beef", weight: 450, price: 2890, ingredients: "Beef, rice, and coarsely chopped vegetables served separately", image: "images/lagman/guiru_ganfan.jpeg" },
  { id: "home-style-lagman-ganfan", name: "Home-style Lagman / Ganfan", category: "lagmans", meat: "beef", weight: 500, price: 2890, ingredients: "Beef, home-style lagman/rice in beef broth", image: "images/lagman/lagman_gaifan_domashnii.jpeg" },
  { id: "lopeiza-lagman", name: "Lopeiza Lagman", category: "lagmans", meat: "mutton", weight: 450, price: 2990, ingredients: "Ancient Uyghur recipe (mutton, glass noodles, vegetables, egg, spices)", image: "images/lagman/lagman_lopeiza.jpeg" },
  { id: "4-seasons-lagman", name: "4 Seasons Lagman", category: "lagmans", meats: ["chicken", "beef", "mutton"], weight: 500, price: 3190, ingredients: "Fried eggplants, fried chicken fillet, beef, mutton, vegetables", image: "images/lagman/lagman_4_sezona.jpeg" },
  { id: "moguru-lagman", name: "Moguru Lagman", category: "lagmans", meat: "beef", weight: 450, price: 2890, ingredients: "Beef with mushrooms, lagman dough", image: "images/lagman/moguru_lagman.jpeg" },
  { id: "dastarkhan-lagman", name: "Dastarkhan Lagman", category: "lagmans", meat: "beef", weight: 450, price: 2890, ingredients: "Beef, noodles, coarsely chopped vegetables, wood ear mushrooms", image: "images/lagman/lagman_dastarkhan.jpeg" },
  { id: "ganbyan-tsomyan-lagman", name: "Ganbyan-Tsomyan Lagman", category: "lagmans", meat: "beef", weight: 400, price: 2890, ingredients: "Fried lagman with beef, sesame, wild leek (jusai), coarsely chopped", image: "images/lagman/lagman_ganbyan_comyan.jpeg" },
  { id: "adzhaiyp-guiru-lagman", name: "Adzhaiyp Guiru Lagman", category: "lagmans", meat: "beef", weight: 450, price: 3490, ingredients: "Fried beef, green onions, spices, hot pepper", image: "images/lagman/adzhaiyp_guiru_lagman.jpeg" },
  { id: "din-din-tsomyan-lagman", name: "Din-Din Tsomyan Lagman", category: "lagmans", meat: "mutton", weight: 400, price: 2890, ingredients: "Fried lagman with mutton, finely chopped ingredients", image: "images/lagman/lagman_din_din_comyan.jpeg" },
  { id: "tandoor-lagman", name: "Tandoor Lagman", category: "lagmans", meat: "mutton", weight: 500, price: 4190, ingredients: "Fried lamb ribs with vegetables and spices, lagman dough", image: "images/lagman/tandyr_lagman.jpeg" },
  { id: "lazro-lagman", name: "Lazro Lagman", category: "lagmans", meat: "mutton", weight: 450, price: 2890, ingredients: "Fried mutton with vegetables and spices, lagman dough", image: "images/lagman/lazro_lagman.jpeg" },
  { id: "oriental-bazaar-salad", name: "Oriental Bazaar Salad", category: "salads", meat: "none", weight: 250, price: 2990, ingredients: "Fried champignons, eggplants, tomatoes, and feta cheese", image: "images/salats/vostochnyi_bazar.jpeg" },
  { id: "pharaoh-salad", name: "Pharaoh Salad", category: "salads", meat: "beef", weight: 250, price: 2390, ingredients: "Beef tongue, fried mushrooms, lettuce, pickles", image: "images/salats/faraon.jpeg" },
  { id: "olivier-salad", name: "Olivier Salad", category: "salads", meat: "beef", weight: 250, price: 1890, ingredients: "Potatoes, carrots, boiled beef, pickles, egg, green peas, mayonnaise", image: "images/salats/olivie.jpeg" },
  { id: "greek-salad", name: "Greek Salad", category: "salads", meat: "none", weight: 250, price: 1990, ingredients: "Cucumbers, tomatoes, olives, feta cheese, lettuce, lemon", image: "images/salats/grecheskii.jpeg" },
  { id: "capercaillie-s-nest-salad", name: "Capercaillie's Nest Salad", category: "salads", meat: "chicken", weight: 250, price: 2190, ingredients: "Pie potatoes, boiled chicken, eggs, pickles, mayonnaise", image: "images/salats/gnezdo_gluharya.jpeg" },
  { id: "caesar-salad", name: "Caesar Salad", category: "salads", meat: "chicken", weight: 250, price: 2390, ingredients: "Napa cabbage, turkey, cherry tomatoes, croutons, mayonnaise, cheese", image: "images/salats/cezar.jpeg" },
  { id: "chinese-salad", name: "Chinese Salad", category: "salads", meat: "beef", weight: 250, price: 2190, ingredients: "Cucumbers, bell peppers, carrots, beef, soy sauce", image: "images/salats/kitaiskii.jpeg" },
  { id: "light-salad", name: "Light Salad", category: "salads", meat: "none", weight: 250, price: 2390, ingredients: "Broccoli, red onion, tomato, feta cheese, lettuce, bell pepper", image: "images/salats/legkii.jpeg" },
  { id: "hunter-s-salad", name: "Hunter's Salad", category: "salads", meats: ["chicken", "beef"], weight: 250, price: 2290, ingredients: "Chicken fillet, smoked turkey, boiled beef, vegetables", image: "images/salats/ohatnichii.jpeg" },
  { id: "fresh-salad", name: "Fresh Salad", category: "salads", meat: "none", weight: 200, price: 1790, ingredients: "Cucumbers, tomatoes, dill, onion (choice of dressing)", image: "images/salats/svezhii.jpeg" },
  { id: "scheherazade-salad", name: "Scheherazade Salad", category: "salads", meat: "chicken", weight: 250, price: 2590, ingredients: "Turkey, cherry tomatoes, red beans, bell pepper, lettuce, balsamic vinegar", image: "images/salats/sharizada.jpeg" },
  { id: "malibu-salad", name: "Malibu Salad", category: "salads", meat: "chicken", weight: 250, price: 2190, ingredients: "Smoked turkey, tomatoes, lettuce, mayonnaise, croutons", image: "images/salats/malibu.jpeg" },
  { id: "achichuk", name: "Achichuk", category: "salads", meat: "none", weight: 200, price: 1690, ingredients: "Tomatoes, onions, chili pepper", image: "images/salats/achichuk.jpeg" },
  { id: "ezme", name: "Ezme", category: "salads", meat: "none", weight: 150, price: 1590, ingredients: "Tomatoes, cucumbers, onion, parsley, hot pepper, pomegranate sauce", image: "images/turkich/iezme.jpeg" },
  { id: "beyti-sarma", name: "Beyti Sarma", category: "turkish", meat: "beef", weight: 380, price: 3990, ingredients: "Minced beef stuffed in eggplant and lavash with onion, tomatoes, topped with cheese and Turkish yogurt", image: "images/turkich/turkich_beitu_sorma.jpeg" },
  { id: "guvec-sebzelik", name: "Guvec Sebzelik", category: "turkish", meat: "none", weight: 300, price: 3590, ingredients: "Pan-fried vegetables covered with cheese", image: "images/turkich/sebzelik.jpeg" },
  { id: "guvec-et", name: "Guvec Et", category: "turkish", meat: "beef", weight: 350, price: 3990, ingredients: "Beef fried with vegetables in a pan, covered with cheese", image: "images/turkich/et_gubiash.jpeg" },
  { id: "guvec-tavuk", name: "Guvec Tavuk", category: "turkish", meat: "chicken", weight: 350, price: 3990, ingredients: "Chicken fillet fried with vegetables in a pan, covered with cheese", image: "images/turkich/tavuk_gubiash.jpeg" },
  { id: "pirzola", name: "Pirzola", category: "turkish", meat: "mutton", weight: 350, price: 4690, ingredients: "Lamb entrecote, garnish, tomatoes, cucumbers, lavash, onion", image: "images/turkich/pirzolla.jpeg" },
  { id: "izgara-kofte", name: "Izgara Kofte", category: "turkish", meats: ["beef", "mutton"], weight: 350, price: 3800, ingredients: "Beef, mutton, and tail fat patties. Garnish, lavash, vegetables", image: "images/shashlyk/izgora_kofta.jpeg" },
  { id: "ali-nazik-kebab", name: "Ali Nazik Kebab", category: "turkish", meat: "beef", weight: 350, price: 4500, ingredients: "Fried beef, yogurt with stewed eggplant, garnish, greens", image: "images/shashlyk/ali_nazik_kebab.jpeg" },
  { id: "adana-kebab", name: "Adana Kebab", category: "turkish", meat: "beef", weight: 350, price: 3800, ingredients: "Minced beef, tail fat, pepper, garnish, tomatoes, cucumbers, greens, onion", image: "images/shashlyk/adana_kebab.jpeg" },
  { id: "assorted-sausages", name: "Assorted Sausages", category: "turkish", meats: ["mutton", "beef", "horse", "chicken"], weight: 500, price: 6990, ingredients: "Mutton, beef, horse meat, chicken, sauce", image: "images/shashlyk/assorti_kolbasok.jpeg" },
  { id: "lyulya-kebab", name: "Lyulya Kebab", category: "turkish", meat: "beef", weight: 300, price: 3100, ingredients: "Minced beef with tail fat, lavash, vegetables", image: "images/shashlyk/lyula_kebab.jpeg" },
  { id: "veal-shashlik", name: "Veal Shashlik", category: "turkish", meat: "beef", weight: 300, price: 4690, ingredients: "Veal meat, lavash, tomatoes, cucumbers, onion", image: "images/shashlyk/shashlyk_telyatina.jpeg" },
  { id: "basyay-funturu", name: "Basyay Funturu", category: "oriental", meat: "mutton", weight: 350, price: 3490, ingredients: "Mutton, glass noodles, napa cabbage, bell pepper", image: "images/vostoshniy/basyai_funturu.jpeg" },
  { id: "bobbin-yanru", name: "Bobbin Yanru", category: "oriental", meat: "mutton", weight: 350, price: 3490, ingredients: "Finely chopped mutton with thin flatbreads", image: "images/vostoshniy/bobbin_yanru.jpeg" },
  { id: "ganza-yu", name: "Ganza Yu", category: "oriental", meat: "fish", weight: 400, price: 3790, ingredients: "Fried crucian carp (whole fish) with spices", image: "images/vostoshniy/ganza_yu.jpeg" },
  { id: "dapanji-with-dough", name: "Dapanji with Dough", category: "oriental", meat: "chicken", weight: 1000, price: 9190, ingredients: "Chicken stewed with vegetables. Served with pieces of dough", image: "images/vostoshniy/dapanpshi.jpeg" },
  { id: "jigyar", name: "Jigyar", category: "oriental", meat: "mutton", weight: 350, price: 2690, ingredients: "Pan-fried lamb liver with tail fat and vegetables", image: "images/vostoshniy/diygar.jpeg" },
  { id: "naryn", name: "Naryn", category: "oriental", meat: "horse", weight: 300, price: 3190, ingredients: "Finely chopped dough with horse meat and broth (served separately)", image: "images/vostoshniy/naryn.jpeg" },
  { id: "authentic-uzbek-pilaf", name: "Authentic Uzbek Pilaf", category: "oriental", meat: "beef", weight: 350, price: 2990, ingredients: "Beef, chickpeas, raisins, yellow and red carrots, lazer rice", image: "images/vostoshniy/plov_prasdnishy.jpeg" },
  { id: "fries-with-meat", name: "Fries with Meat", category: "oriental", meat: "other", weight: 350, price: 3590, ingredients: "Fried beef with french fries and vegetables", image: "images/vostoshniy/fri_s_miasom.jpeg" },
  { id: "guiru-syay", name: "Guiru Syay", category: "oriental", meat: "beef", weight: 350, price: 4190, ingredients: "Beef, bell pepper, napa cabbage, onion", image: "images/vostoshniy/guiru_say.jpeg" },
  { id: "pan-fried-mutton", name: "Pan-fried Mutton", category: "oriental", meat: "mutton", weight: 400, price: 7590, ingredients: "Pan-fried mutton seasoned with fresh onions", image: "images/vostoshniy/jarenny_barabina_na_skobarade.jpeg" },
  { id: "lamb-kazan-kebab", name: "Lamb Kazan Kebab", category: "oriental", meat: "mutton", weight: 400, price: 4390, ingredients: "Mutton roasted with onions over high heat (with potatoes)", image: "images/vostoshniy/kazan_kebab_barabiba.jpeg" },
  { id: "beef-kazan-kebab", name: "Beef Kazan Kebab", category: "oriental", meat: "beef", weight: 400, price: 4390, ingredients: "Tender beef roasted with onions over high heat", image: "images/vostoshniy/kazan_kebab_gobiadina.jpeg" },
  { id: "kok-syay", name: "Kok Syay", category: "oriental", meat: "none", weight: 300, price: 2290, ingredients: "Fried broccoli with vegetables", image: "images/vostoshniy/kok_siay.jpeg" },
  { id: "lazzhi", name: "Lazzhi", category: "oriental", meat: "chicken", weight: 350, price: 3490, ingredients: "Chicken fillet, bell pepper, spices", image: "images/vostoshniy/lazzhi.jpeg" },
  { id: "manpar-tsomyan", name: "Manpar Tsomyan", category: "oriental", meat: "other", weight: 400, price: 2890, ingredients: "Finely chopped dough fried with meat and vegetables", image: "images/vostoshniy/manpar_somian.jpeg" },
  { id: "moguru-syay", name: "Moguru Syay", category: "oriental", meat: "mutton", weight: 350, price: 3390, ingredients: "Fried mutton, wood ear mushrooms, cucumbers, and spices", image: "images/vostoshniy/moguru_siay.jpeg" },
  { id: "myn-zhyn-yanru", name: "Myn Zhyn Yanru", category: "oriental", meat: "mutton", weight: 350, price: 3190, ingredients: "Fried mutton with vegetables", image: "images/vostoshniy/myn_zhyn_yianry.jpeg" },
  { id: "bash-manpar", name: "Bash Manpar", category: "oriental", meat: "other", weight: 400, price: 2500, ingredients: "Traditional soup with small dumplings, meat, and vegetables", image: "images/vostoshniy/bash_manpar.jpeg" },
  { id: "beshbarmak", name: "Beshbarmak", category: "oriental", meat: "other", weight: 450, price: 3800, ingredients: "Boiled meat, dough, rich meat broth with onions", image: "images/vostoshniy/besh.jpeg" },
  { id: "grilled-salmon", name: "Grilled Salmon", category: "oriental", meat: "fish", weight: 250, price: 4900, ingredients: "Salmon fillet with spices and lemon", image: "images/vostoshniy/siomga.jpeg" },
  { id: "grilled-trout", name: "Grilled Trout", category: "oriental", meat: "fish", weight: 300, price: 4200, ingredients: "Tender grilled trout with lemon", image: "images/vostoshniy/forel_gril.jpeg" }
]);
