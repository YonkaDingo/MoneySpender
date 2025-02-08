# MoneySpender
A bot that polls BestBuy servers for stock of an item, and then opens a browser to that item with your authentication cookies and adds it to your cart.

Change the variables 'LINK', 'SKU', and 'ZIP' inside of "index.js" to reflect your purchasing intent. 

You must export your authentication cookies from bestbuy into a JSON file and place it in the module directory. 
To do this, simply install a JSON cookie exporter chrome extension, sign into the best buy website and then use the extension to export your BestBuy.com cookies.
Name this file "cookies.json".
