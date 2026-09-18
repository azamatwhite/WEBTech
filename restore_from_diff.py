import re

index_diff = """@@ -1,128 +1,105 @@
 <!DOCTYPE html>
 <html lang="en">
-
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
-    <meta name="description"
-        content="Dastarkhan - Authentic Eastern and Kazakh national cuisine in Astana. Find our locations and opening hours.">
-    <meta name="author" content="Ruslan Absamat">
-    <title>Dastarkhan - Home</title>
+    <meta name="description" content="Saya Sushi - The best sushi and rolls in Astana. Find our locations and opening hours.">
+    <meta name="author" content="Azamat, Ruslan, Miko">
+    <title>Saya Sushi - Home</title>
 </head>
-
 <body>
-    <header>
-        <b>Dastarkhan</b>
-        <nav>
-            <ul>
-                <li><a href="index.html">Home</a></li>
-                <li><a href="menu.html">Menu</a></li>
-                <li><a href="delivery.html">Delivery</a></li>
-                <li><a href="about.html">About Us</a></li>
-                <li><a href="booking.html">Booking</a></li>
-                <li><a href="gallery.html">Gallery</a></li>
-                <li><a href="feedback.html">Feedback</a></li>
-                <li><a href="careers.html">Careers</a></li>
-            </ul>
-        </nav>
-    </header>
-
-    <main>
-        <h1>Welcome to Dastarkhan</h1>
-
-        <!-- The slogan is placed right under the h1 so it is the very first message a visitor reads, reinforcing the brand identity immediately -->
-        <p><em><strong>Experience the true taste of the East!</strong></em></p>
-
-        <section>
-            <h2>Authentic Flavors and Traditions</h2>
-            <p>Welcome to Dastarkhan, your ultimate destination for fresh, high-quality Eastern and Kazakh national
-                cuisine in Astana. Whether you are craving our signature handmade lagman or a hearty, festive plov, our
-                chefs prepare every dish with passion and top-tier halal ingredients according to original traditions.
-            </p>
-
-            <figure>
-                <!-- The outside/interior photo is placed here to show the restaurant atmosphere -->
-                <img src="images/interior/IMG_1167.jpg" alt="Interior decoration of Dastarkhan restaurant in Astana"
-                    width="400">
-                <figcaption>Our beautifully decorated Dastarkhan &mdash; find us and step in!</figcaption>
-            </figure>
-        </section>
-
-        <hr>
-
-        <section>
-            <h2>Our Dedication to Quality</h2>
-            <p>At Dastarkhan, our journey began with a simple but strict idea: to serve authentic dishes using
-                traditional recipes and local fresh meat. We believe that great food starts with great ingredients. That
-                is why we purchase only fresh halal meat delivered daily from local farms, use traditional spice blends
-                like Zira and Star Anise, and cook our meals in classic cast-iron kazans. Whether you are craving a
-                sizzling shashlyk, freshly pulled noodles, or our rich broths, we promise an unforgettable flavor
-                experience every time you dine with us.</p>
-
-            <p>Our commitment to excellence has earned us a loyal following across the city. Do not just take our word
-                for it—our customers say it best:</p>
-            <blockquote>
-                <p>"Dastarkhan has completely set a new standard for Eastern cuisine. Their lagman is always hot, the
-                    meat is incredibly fresh, and their festive plov is a game-changer for family dinners!" <br>
-                    &mdash; <cite>Aigerim N., Astana</cite>, October 2025</p>
-            </blockquote>
-        </section>
-
-        <hr>
-
-        <section>
-            <h2>Opening Hours</h2>
-            <p>We are open every day to serve you the best Eastern cuisine in town:</p>
-            <p><strong>Monday &ndash; Sunday: 11:00 to 00:00</strong></p>
-        </section>
-
-        <section>
-            <h2>Our Locations in Astana</h2>
-            <p>Find your nearest Dastarkhan branch for takeout or dine-in:</p>
-            <ul>
-                <li>Mukhtar Auezov Street, 33</li>
-                <li>Dostyk Street, 1</li>
-            </ul>
-        </section>
-
-        <section>
-            <h2>Restaurant Features &amp; Amenities</h2>
-            <p><strong>Cuisine:</strong> Eastern, Uyghur. <em>Average bill: 4000 ₸</em></p>
-            <p><strong>Menu Highlights:</strong> Shashlik, Chebureki, Pelmeni, Manti, Samsa, Lagman, Salads, Plov.</p>
-            <p><strong>Services:</strong> Takeaway, Delivery, Banquet Hosting.</p>
-            <p><strong>Amenities:</strong> Up to 120 seats, Private booths, Laptop friendly.</p>
-            <p><strong>Payment Methods:</strong> Card payment, Cash, QR-code payment.</p>
-            <p><strong>Accessibility:</strong> Ramp, Wheelchair accessible entrance.</p>
-        </section>
-
-        <section>
-            <h2>Inside Our Restaurant</h2>
-            <p>Step inside and enjoy a warm, welcoming atmosphere. Our interiors are designed in a classic oriental
-                style to give you a comfortable dining experience whether you are celebrating in our VIP room, having a
-                family dinner on a tapchan, or grabbing a quick lunch.</p>
-
-            <figure>
-                <img src="images/interior/IMG_1170.jpg"
-                    alt="Dining area inside Dastarkhan restaurant showing tables and warm lighting" width="400">
-                <figcaption>A warm and welcoming dining space at Dastarkhan</figcaption>
-            </figure>
-
-            <figure>
-                <img src="images/interior/IMG_1157.jpg"
-                    alt="Interior of Dastarkhan showing traditional tapchan seating arrangement and decor" width="400">
-                <figcaption>Comfortable oriental tapchan seating for family and friends</figcaption>
-            </figure>
-        </section>
-
-    </main>
-
-    <footer>
-        <p>Follow us on <a href="https://www.instagram.com/md.group_vostochki?stkn=cWlkejF5NHFubGV5" target="_blank"
-                rel="noopener">Instagram</a> or find us on <a href="https://2gis.kz/astana" target="_blank"
-                rel="noopener">2GIS</a>.</p>
-        <p>Reservations: <a href="tel:+77172319595">+7 (7172) 31-95-95</a> | Delivery: <a href="tel:+77788710792">+7-778-871-07-92</a></p>
-        <p>&copy; 2026 Dastarkhan Restaurant</p>
-    </footer>"""

careers_diff = """@@ -1,133 +1,150 @@
 <!DOCTYPE html>
 <html lang="en">
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
-    <meta name="description" content="Careers at Dastarkhan - Join our team and build a career in authentic Eastern hospitality.">
     <meta name="author" content="Ruslan Absamat">
     <title>Careers - Dastarkhan</title>
 </head>
 <body>
-<header>
-    <b>Dastarkhan</b>
-    <nav>
-        <ul>
-            <li><a href="index.html">Home</a></li>
-            <li><a href="menu.html">Menu</a></li>
-            <li><a href="delivery.html">Delivery</a></li>
-            <li><a href="about.html">About Us</a></li>
-            <li><a href="booking.html">Booking</a></li>
-            <li><a href="gallery.html">Gallery</a></li>
-            <li><a href="feedback.html">Feedback</a></li>
-            <li><a href="careers.html">Careers</a></li>
-        </ul>
-    </nav>
-</header>
-
-<main>
-    <h1>Join Our Team</h1>
-
-    <section>
-        <h2>Build a Career in Eastern Hospitality</h2>
-        <p>Dastarkhan is growing! We are always looking for passionate, hardworking individuals who love authentic Eastern and Kazakh national cuisine to join our family. Whether you are an experienced chef or looking for your first job in the restaurant industry, we have a place for you.</p>
-
-        <h3>Why Work With Us?</h3>
-        <ul>
-            <li><strong>Competitive Salary:</strong> We offer great pay and fair compensation for all our staff.</li>
-            <li><strong>Free Staff Meals:</strong> Enjoy our delicious lagman, plov, and more during your shifts.</li>
-            <li><strong>Career Growth:</strong> We believe in promoting from within and training our team.</li>
-            <li><strong>Friendly Atmosphere:</strong> Work in a supportive, respectful, and fast-paced environment.</li>
-        </ul>
-    </section>
-
-    <hr>
-
-    <section>
-        <h2>Open Positions</h2>
-        
-        <article>
-            <h3>Line Cooks / Chefs</h3>
-            <p>Prepare our authentic dishes! Experience with kazans, pulling lagman dough, or grilling shashlyk is a big plus.</p>
-        </article>
-
-        <article>
-            <h3>Waitstaff / Servers</h3>
-            <p>Provide excellent customer service, guide guests through our menu, and ensure they experience true Eastern hospitality.</p>
-        </article>
-
-        <article>
-            <h3>Host / Hostess</h3>
-            <p>Be the welcoming face of Dastarkhan! Greet guests, manage reservations, and seat them comfortably.</p>
-        </article>
-        
-        <article>
-            <h3>Cleaning Staff / Dishwashers</h3>
-            <p>Keep our restaurant sparkling clean. Responsible for doing the dishes, cleaning the kitchen, and maintaining a hygienic dining hall.</p>
-        </article>
-
-        <article>
-            <h3>Delivery Couriers</h3>
-            <p>Deliver our hot food safely and on time to our customers across Astana.</p>
-        </article>
-    </section>
-
-    <hr>
-
-    <section>
-        <h2>Apply Now</h2>
-        <p>Fill out the form below to apply for a position. We will get back to you soon!</p>
-        
-        <form method="get" action="#">
-            <fieldset>
-                <legend>Applicant Information</legend>
-                <div>
-                    <label for="appName">Full Name:</label>
-                    <input type="text" id="appName" name="appName" placeholder="Your Name" required>
-                </div>
-                <br>
-                <div>
-                    <label for="appPhone">Phone Number:</label>
-                    <input type="tel" id="appPhone" name="appPhone" placeholder="+7 700 000 00 00" required>
-                </div>
-            </fieldset>
-
-            <br>
-
-            <fieldset>
-                <legend>Position Details</legend>
-                <div>
-                    <label for="positionSelect">Position of Interest:</label>
-                    <select id="positionSelect" name="positionSelect" required>
-                        <option value="" disabled selected>Select a position...</option>
-                        <option value="chef">Line Cook / Chef</option>
-                        <option value="waiter">Waitstaff / Server</option>
-                        <option value="host">Host / Hostess</option>
-                        <option value="cleaner">Cleaning Staff / Dishwasher</option>
-                        <option value="courier">Delivery Courier</option>
-                    </select>
-                </div>
-                <br>
-                <div>
-                    <label for="appExperience">Brief Experience / Cover Letter:</label><br>
-                    <textarea id="appExperience" name="appExperience" rows="5" cols="40" placeholder="Tell us a bit about your experience..."></textarea>
-                </div>
-            </fieldset>
-
-            <br>
-
-            <div>
-                <button type="submit">Submit Application</button>
-            </div>
-        </form>
-    </section>
-
-</main>
-
-<footer>
-    <p>Follow us on <a href="https://www.instagram.com/md.group_vostochki?stkn=cWlkejF5NHFubGV5" target="_blank" rel="noopener">Instagram</a> or find us on <a href="https://2gis.kz/astana" target="_blank" rel="noopener">2GIS</a>.</p>
-    <p>Reservations: <a href="tel:+77172319595">+7 (7172) 31-95-95</a> | Delivery: <a href="tel:+77788710792">+7-778-871-07-92</a></p>
-    <p>&copy; 2026 Dastarkhan Restaurant</p>
-</footer>"""

def extract(diff_text):
    res = []
    for line in diff_text.split('\n'):
        if line.startswith('@@'): continue
        if line.startswith('-'): res.append(line[1:])
        elif line.startswith(' '): res.append(line[1:])
    return '\n'.join(res)

with open('index.html', 'w') as f:
    f.write(extract(index_diff))
with open('careers.html', 'w') as f:
    # Need to add <meta name="description"... since it was split in diff
    # But wait, careers_diff has `<meta name="description" content="Careers at Dastarkhan - Join our team and build a career in authentic Eastern hospitality.">`
    f.write(extract(careers_diff))
