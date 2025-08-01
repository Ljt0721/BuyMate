# Backend API

## Experiment APIs

### Get product information

#### Get URL

```bash
GET /experiment_api/products/
```

#### Request Parameters

| Parameters      | type  | desciption    |
| --------------- | ----- | ------------- |
| `experiment_id` | `int` | ID for experiment |

#### Get Return data

Return a json list, including all the products used in the experiment.  
Information about one product is listed as follows.

| Field Name         | Type           | Description                        |
| ------------------ | -------------- | ---------------------------------- |
| `id`               | `int`          | Product primary key ID             |
| `experiment_id`    | `int`          | Associated experiment ID           |
| `image_id`         | `int`          | Image ID                           |
| `name`             | `string`       | Product name                       |
| `brand`            | `string`       | Brand name                         |
| `current_price`    | `float`        | Current price                      |
| `original_price`   | `float`        | Original price                     |
| `live_price`       | `float`        | Live-stream price                  |
| `price_comparison` | `string`       | Price comparison description       |
| `discount_info`    | `string`       | Discount information               |
| `sizes`            | `string`       | Size information                   |
| `material`         | `string`       | Material description               |
| `style`            | `string`       | Style                              |
| `colors`           | `string`       | Color information                  |
| `features`         | `string`       | Product features                   |
| `sales_rating`     | `float`        | Sales rating                       |
| `shipping_time`    | `string`       | Estimated shipping time            |
| `sales_volume`     | `string`       | Sales volume (e.g., "12k+")        |
| `reviews_count`    | `string`       | Review count (e.g., "231 reviews") |
| `shipping_info`    | `list[string]` | Shipping-related information       |
| `return_policy`    | `list[string]` | Return policy                      |

### Submit experiment info

#### Submit URL

```bash
POST /experiment_api/experiment/submit/
```

#### Request Body

A JSON object containing information about a subject's experiment result.

| Field Name      | Type     | Description                                    |
| --------------- | -------- | ---------------------------------------------- |
| `subject_id`    | `int`    | Subject's ID                                   |
| `experiment_id` | `int`    | Associated experiment ID                       |
| `subject_type`  | `int`    | Type of subject                                |
| `choice`        | `bool`   | User's choice result                           |
| `choice_time`   | `string` | Time taken for the choice                      |

#### Submit Return data

A JSON object indicating whether the experiment info was saved successfully.

| Field Name | Type     | Description                        |
| ---------- | -------- | ---------------------------------- |
| `success`  | `bool`   | `true` if saved, otherwise `false` |
| `error`    | `string` | Error message (only if failed)     |

### Get video/image

video:  

```html
<video src={`${config.BACKEND_BASE_URL}/media/videos/xx.mp4`} controls />
```  

image:  

```html
<img src={`${config.BACKEND_BASE_URL}/media/images/x-x.jpg`} />
```  

## Questionnaire APIs
