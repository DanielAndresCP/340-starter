-- Insert Iron Man account
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony','Stark','tony@starkent.com','Iam1ronM@n');



-- Change account type for iron man to admin
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;



-- Delete tony stark account
DELETE FROM public.account WHERE account_id = 1;


-- Edit GM hummer description
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10;


-- Get make, model and classification name for inventory items with classification of 'Sport'
SELECT 
	i.inv_make,
	i.inv_model,
	c.classification_name
FROM public.inventory AS i
INNER JOIN public.classification AS c
	ON c.classification_id = i.classification_id
WHERE c.classification_name = 'Sport';



-- Add /vehicles to the middle of the img path for main and thumbnail image
UPDATE public.inventory
SET
	inv_image = REPLACE(inv_image,'/images','/images/vehicles'),
	inv_thumbnail = REPLACE(inv_thumbnail,'/images','/images/vehicles');