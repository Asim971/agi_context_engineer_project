                                    API - Usage Guide

# Nation API - Usage Guide for ACL & ACSL

## Authentication
All requests must include:

X-API-KEY: Ps6qp_oCu0N0ZhsQPAZSIL4AgHBvmE0-sG_OyWoegOM
Content-Type: application/json


## 📦 Available Endpoints

### 🔹 Create Nation

- **URL:** http://127.0.0.1:8017/api/nation/create
- **Method:** `POST`
- **Headers:** See Authentication
- **Body:**


Payload = {
  "name": "Bangladesh"
}

Success Response
{
  "id": 1,
  "name": "Bangladesh"
}


🔹 Update Nation

URL: http://127.0.0.1:8017/api/nation/update/<int:nation_id>
Method: PUT
Headers: See Authentication

Payload = {
  "name": "Canada"
}

Success Response:
json
{
  "id": 1,
  "name": "Canada"
}

🔹 Delete Nation

URL:  http://127.0.0.1:8017/api/nation/delete/<int:nation_id>
Method: DELETE
Headers: See Authentication

Success Response:

HTTP 200 OK
"Deleted"

🛡️ Security Notes
Never expose API tokens in public or client-side JS.

# Division API - Usage Guide for ACL & ACSL

## Authentication
All requests must include:

X-API-KEY: Ps6qp_oCu0N0ZhsQPAZSIL4AgHBvmE0-sG_OyWoegOM
Content-Type: application/json


## 📦 Available Endpoints

### 🔹 Create Division

- **URL:** http://127.0.0.1:8017/api/division/create

- **Method:** `POST`
- **Headers:** See Authentication
Payload = {
  "name": "Dhaka",
  "nation_id": 1
}

Success Response
{
  "id": 1,
  "name": "Dhaka"
}


🔹 Update Division

URL: http://127.0.0.1:8017/api/division/update/<int:division_id>
Method: PUT
Headers: See Authentication

Payload = {
  "name": "Chattogram"
}
Success Response:

json
{
  "id": 1,

  "name": "Chattogram"}

🔹 Delete Division

URL:  http://127.0.0.1:8017/api/division/delete/<int:division_id>
Method: DELETE
Headers: See Authentication

Success Response:

HTTP 200 OK
"Deleted"

🛡️ Security Notes
Never expose API tokens in public or client-side JS.



# District API - Usage Guide for ACL & ACSL

## Authentication
All requests must include:


X-API-KEY: Ps6qp_oCu0N0ZhsQPAZSIL4AgHBvmE0-sG_OyWoegOM
Content-Type: application/json


## 📦 Available Endpoints

### 🔹 Create District

- **URL:** http://127.0.0.1:8017/api/district/create
- **Method:** `POST`
- **Headers:** See Authentication

Payload = {
  "name": "Comilla",
  "nation_id": 1,
  "division_id": 2
}

Success Response
{
  "id": 1,
  "name": "Comilla"
}


🔹 Update District

URL: http://127.0.0.1:8017/api/district/update/<int:district_id>
Method: PUT
Headers: See Authentication

Payload = {
  "division_id": 3
}
Success Response:

json
{
  "id": 1,

  "name": "Comilla"}



🔹 Delete District

URL:  http://127.0.0.1:8017/api/district/delete/<int:district_id>
Method: DELETE
Headers: See Authentication

Success Response:

HTTP 200 OK
"District Deleted Successfully"

🛡️ Security Notes
Never expose API tokens in public or client-side JS.


# Upazila API - Usage Guide for ACL & ACSL

## Authentication
All requests must include:


X-API-KEY: Ps6qp_oCu0N0ZhsQPAZSIL4AgHBvmE0-sG_OyWoegOM
Content-Type: application/json


## 📦 Available Endpoints

### 🔹 Create Upazila

- **URL:** http://127.0.0.1:8017/api/thana/create
- **Method:** `POST`
- **Headers:** See Authentication

Payload ={
  "name": "Dhanmondi",
  "nation_id": 1,
  "division_id": 1,
  "district_id": 1
}

Success Response
{
  "id": 1,
   "name": "Dhanmondi"}


🔹 Update Upazila

URL: http://127.0.0.1:8017/api/thana/update/<int:thana_id>
Method: PUT
Headers: See Authentication

Payload = {
  "district_id": 2

}
Success Response:

json
{
  "id": 1,

  "name": "Dhanmondi"}



🔹 Delete Upazila

URL:  http://127.0.0.1:8017/api/thana/delete/<int:thana_id>
Method: DELETE
Headers: See Authentication

Success Response:

HTTP 200 OK
"Upazila Deleted Successfully"

🛡️ Security Notes
Never expose API tokens in public or client-side JS.

# Bazar API - Usage Guide for ACL & ACSL

## Authentication
All requests must include:



X-API-KEY: Ps6qp_oCu0N0ZhsQPAZSIL4AgHBvmE0-sG_OyWoegOM
Content-Type: application/json


## 📦 Available Endpoints

### 🔹 Create Bazar

- **URL:** http://127.0.0.1:8017/api/bazar/create
- **Method:** `POST`
- **Headers:** See Authentication

Payload ={
  "name": "Banani Bazar",
  "nation_id": 1,
  "division_id": 1,
  "district_id": 1,
  "thana_id": 1
}

Success Response
{
  "id": 1,
   "name": "Banani Bazar"}


🔹 Update Bazar

URL: http://127.0.0.1:8017/api/bazar/update/<int:bazar_id>
Method: PUT
Headers: See Authentication

Payload = {
  "district_id": 2,
  "thana_id": 3
}
Success Response:

json
{
  "id": 1,
  "name": "Banani Bazar"}



🔹 Delete Bazar

URL:  http://127.0.0.1:8017/api/bazar/delete/<int:bazar_id>
Method: DELETE
Headers: See Authentication

Success Response:

HTTP 200 OK
"Bazar Deleted Successfully"

🛡️ Security Notes
Never expose API tokens in public or client-side JS.


# Zone API - Usage Guide for ACL & ACSL

## Authentication
All requests must include:


X-API-KEY: Ps6qp_oCu0N0ZhsQPAZSIL4AgHBvmE0-sG_OyWoegOM
Content-Type: application/json


## 📦 Available Endpoints

### 🔹 Create Zone

- **URL:** http://127.0.0.1:8017/api/zone/create
- **Method:** `POST`
- **Headers:** See Authentication

Payload ={
  "name": "Central Zone",
  "nation_id": 1,
  "division_id": 2
}

Success Response
{
  "id": 1,
   "name": "Central Zone"}


🔹 Update Zone

URL: http://127.0.0.1:8017/api/zone/update/<int:zone_id>
Method: PUT
Headers: See Authentication

Payload = {
   "division_id": 3


}
Success Response:

json
{
  "id": 1,
  "name": "Central Zone"}





🔹 Delete Zone

URL:  http://127.0.0.1:8017/api/zone/delete/<int:zone_id>
Method: DELETE
Headers: See Authentication

Success Response:

HTTP 200 OK
"Zone Deleted Successfully"

🛡️ Security Notes
Never expose API tokens in public or client-side JS.


# Area API - Usage Guide for ACL & ACSL

## Authentication
All requests must include:


X-API-KEY: Ps6qp_oCu0N0ZhsQPAZSIL4AgHBvmE0-sG_OyWoegOM
Content-Type: application/json


## 📦 Available Endpoints

### 🔹 Create Area

- **URL:** http://127.0.0.1:8017/api/area/create
- **Method:** `POST`
- **Headers:** See Authentication

Payload {
  "name": "Motijheel Area",
  "nation_id": 1,
  "division_id": 2,
  "zone_id": 3
}

Success Response
{
  "id": 1,
   "name": "Motijheel Area"}


🔹 Update Area

URL: http://127.0.0.1:8017/api/area/update/<int:area_id>
Method: PUT
Headers: See Authentication

Payload = {
  "division_id": 3,
  "zone_id": 4

}

Success Response:

json
{
  "id": 1,
  "name": "Motijheel Area"}

🔹 Delete Area

URL:  http://127.0.0.1:8017/api/area/delete/<int:area_id>
Method: DELETE
Headers: See Authentication

Success Response:

HTTP 200 OK
"Area Deleted Successfully"

🛡️ Security Notes
Never expose API tokens in public or client-side JS.

# Territory API - Usage Guide for ACL & ACSL

## Authentication
All requests must include:

X-API-KEY: Ps6qp_oCu0N0ZhsQPAZSIL4AgHBvmE0-sG_OyWoegOM
Content-Type: application/json


## 📦 Available Endpoints

### 🔹 Create Territory
- **URL:** http://127.0.0.1:8017/api/territory/create

- **Method:** `POST`
- **Headers:** See Authentication

Payload ={
  "name": "Uttara Territory",
  "nation_id": 1,
  "division_id": 2,
  "zone_id": 3,
  "area_id": 4,
  "bazar_id": [5, 6]
}

Success Response
{
  "id": 1,
   "name": "Uttara Territory"}


🔹 Update Territory

URL: http://127.0.0.1:8017/api/territory/update/<int:territory_id>
Method: PUT
Headers: See Authentication

Payload = {
  "zone_id": 3,
  "area_id": 5,
  "bazar_id": [5, 6,7]
}

Success Response:

json
{
  "id": 1,
  "name": "Uttara Territory"}

🔹 Delete Territory

URL:  http://127.0.0.1:8017/api/territory/delete/<int:territory_id>
Method: DELETE
Headers: See Authentication

Success Response:

HTTP 200 OK
"Territory Deleted Successfully"


🛡️ Security Notes
Never expose API tokens in public or client-side JS.


Note : API KEY and IP will be changed in production Database.












