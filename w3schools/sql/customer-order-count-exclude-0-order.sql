SELECT
	c.Country AS 'Country',
	c.CustomerName as 'Customer Name',
    COUNT(o.OrderID) AS 'Count (Orders)'
FROM 
  	Customers AS c 
  	INNER JOIN Orders o 
    	ON c.CustomerID = o.CustomerID
GROUP BY 
	c.CustomerID
ORDER BY 
	c.Country ASC, c.CustomerName ASC;