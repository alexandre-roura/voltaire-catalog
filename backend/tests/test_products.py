PRODUCT_PAYLOAD = {
    "name": "Blue Infinite",
    "category": "selle",
    "sku": "SELL-BI-001",
    "description": "Née pour performer",
    "price": 4500.0,
    "stock": 10,
    "image_url": None,
}


def test_list_products_empty(client):
    response = client.get("/products")
    assert response.status_code == 200
    assert response.json() == []


def test_create_product(client, auth_headers):
    response = client.post("/products", json=PRODUCT_PAYLOAD, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Blue Infinite"
    assert data["sku"] == "SELL-BI-001"
    assert "id" in data


def test_list_products(client, auth_headers):
    client.post("/products", json=PRODUCT_PAYLOAD, headers=auth_headers)
    response = client.get("/products")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_list_products_filter_category(client, auth_headers):
    client.post("/products", json=PRODUCT_PAYLOAD, headers=auth_headers)
    etrier_payload = {**PRODUCT_PAYLOAD, "name": "Etrier Compositi Reflex", "sku": "ETR-REFLEX-001", "category": "etrier"}
    client.post("/products", json=etrier_payload, headers=auth_headers)

    response = client.get("/products?category=selle")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["category"] == "selle"


def test_get_product(client, auth_headers):
    created = client.post("/products", json=PRODUCT_PAYLOAD, headers=auth_headers)
    product_id = created.json()["id"]

    response = client.get(f"/products/{product_id}")
    assert response.status_code == 200
    assert response.json()["id"] == product_id


def test_get_product_not_found(client):
    response = client.get("/products/nonexistent-id")
    assert response.status_code == 404


def test_update_product(client, auth_headers):
    created = client.post("/products", json=PRODUCT_PAYLOAD, headers=auth_headers)
    product_id = created.json()["id"]

    response = client.put(
        f"/products/{product_id}",
        json={"stock": 5, "price": 399.0},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["stock"] == 5
    assert response.json()["price"] == 399.0


def test_delete_product(client, auth_headers):
    created = client.post("/products", json=PRODUCT_PAYLOAD, headers=auth_headers)
    product_id = created.json()["id"]

    response = client.delete(f"/products/{product_id}", headers=auth_headers)
    assert response.status_code == 204

    response = client.get(f"/products/{product_id}")
    assert response.status_code == 404


def test_create_product_requires_auth(client):
    response = client.post("/products", json=PRODUCT_PAYLOAD)
    assert response.status_code == 401


def test_list_products_filter_in_stock(client, auth_headers):
    out_of_stock = {**PRODUCT_PAYLOAD, "name": "Blue Jumpeur", "sku": "SELL-BJ-001", "stock": 0}
    client.post("/products", json=PRODUCT_PAYLOAD, headers=auth_headers)
    client.post("/products", json=out_of_stock, headers=auth_headers)

    response = client.get("/products?in_stock=true")
    assert response.status_code == 200
    assert len(response.json()) == 1
