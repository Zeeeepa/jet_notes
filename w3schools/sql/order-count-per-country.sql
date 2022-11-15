SELECT
	c.Country AS Country,
    COUNT(o.OrderID) AS 'Count (Orders)'
FROM 
  	Customers AS c 
  	LEFT JOIN Orders o 
    	ON c.CustomerID = o.CustomerID
GROUP BY 
	c.Country
ORDER BY 
	Country ASC;