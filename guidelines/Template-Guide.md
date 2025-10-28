# Spintax and Tokens Guide

A comprehensive guide to using spintax syntax, CSV tokens, and image preview functionality in the website generator system.

---

## Getting Started

**Simple Setup:** To create a new template, simply create an Astro project inside the `templates/` folder and start developing. 

```
templates/
└── your-template-name/     // Create your Astro project here
    ├── src/
    ├── public/
    ├── package.json
    └── astro.config.mjs
```

Then reference your template in the CSV:
```csv
template,domain,name,...
your-template-name,example.com,Business Name,...
```

---

## Table of Contents
1. [Quick Reference](#quick-reference)
2. [Spintax Syntax](#spintax-syntax)
3. [CSV Tokens](#csv-tokens)
4. [SpintaxImagePreview](#spintaximagepreview)
5. [Combining Spintax and Tokens](#combining-spintax-and-tokens)
6. [Best Practices](#best-practices)
7. [Common Mistakes](#common-mistakes)
8. [Examples](#examples)

---

## Quick Reference

### Spintax Syntax
```astro
[[option1|option2|option3]]          // Basic spintax
[[option1~2|option2~1]]              // Weighted spintax
[[outer|[[inner1|inner2]]]]          // Nested spintax
```

### Token Syntax
```astro
{{domain}}                           // Simple token
{{service_name}} in {{city}}         // Multiple tokens
```

### Image Preview
```astro
import { SpintaxImagePreview } from "@repo/spintax-preview";

const image = SpintaxImagePreview({
  spintaxItem: [img1, img2, img3],
  previewItemIndex: 0                // 0 = first image
});
```

---

## Spintax Syntax

Spintax creates random content variations. Each generation selects one option randomly.

### 1. Basic Spintax

**Syntax:** `[[option1|option2|option3]]`

**Example:**
```astro
<h1>[[Professional|Expert|Certified]] Electrician Services</h1>
```

**Possible outputs:**
- "Professional Electrician Services"
- "Expert Electrician Services"
- "Certified Electrician Services"

### 2. Multiple Spintax in One Sentence

```astro
<p>
  We offer [[fast|quick|rapid]] and [[reliable|dependable|trustworthy]] 
  service in [[London|Greater London|the London area]].
</p>
```

**Example output:**
- "We offer quick and reliable service in Greater London."

### 3. Nested Spintax

**Syntax:** `[[option1|[[nested1|nested2]]]]`

```astro
<h2>[[Professional|Expert|[[Certified|Licensed]]]] Plumber</h2>
```

**Possible outputs:**
- "Professional Plumber"
- "Expert Plumber"
- "Certified Plumber"
- "Licensed Plumber"

**Note:** Maximum recommended nesting: 2 levels

### 4. Weighted Spintax

Give options different selection probabilities.

**Syntax:** `[[option1~weight|option2~weight]]`

```astro
<h2>[[Emergency~3|Urgent~2|Fast~1]] Electrical Services</h2>
```

**Selection probability:**
- "Emergency" = 50% (3 out of 6)
- "Urgent" = 33% (2 out of 6)
- "Fast" = 17% (1 out of 6)

**Note:** Use the tilde (`~`) character to separate the option from its weight.

### 5. Multi-line Spintax

```astro
<p>
  [[
    We provide top-quality electrical services.|
    Our electricians deliver exceptional service.|
    Get professional electrical solutions today.
  ]]
</p>
```

### 6. Spintax in Different Contexts

#### In Headings
```astro
<h1>[[Best|Top|Leading]] {{service_name}} in {{city}}</h1>
```

#### In Paragraphs
```astro
<p>
  [[Contact|Call|Reach out to]] us for [[immediate|quick|fast]] assistance.
  Our [[experienced|skilled|certified]] team is ready to help.
</p>
```

#### In Links
```astro
<a href="/contact">
  [[Get in Touch|Contact Us|Reach Out]]
</a>
```

#### In Alt Text
```astro
<img 
  src="team.jpg" 
  alt="[[Professional|Expert|Certified]] {{service_name}} team"
/>
```

#### In Lists
```astro
<ul>
  <li>[[Fast|Quick|Rapid]] response time</li>
  <li>[[Experienced|Skilled|Certified]] technicians</li>
  <li>[[Affordable|Competitive|Fair]] pricing</li>
</ul>
```

### 7. Where Spintax Works

✅ **Works in:**
- `.astro` files (HTML/template sections)
- Markdown files with frontmatter
- Text content
- HTML attributes
- Alt text
- Meta descriptions (via tokens)

❌ **Does NOT work in:**
- JavaScript/TypeScript code blocks
- CSS/SCSS files
- `<script>` tags
- `<style>` tags
- JSON data files
- Framework components (React, Vue, Svelte)

**Example - What Works:**
```astro
---
// ❌ Won't process here
const title = "[[Professional|Expert]]";
---

<!-- ✅ Will process here -->
<h1>[[Professional|Expert]] Services</h1>

<script>
  // ❌ Won't process here
  console.log("[[Professional|Expert]]");
</script>

<style>
  /* ❌ Won't process here */
  .title::before {
    content: "[[Professional|Expert]]";
  }
</style>
```

---

## CSV Tokens

Tokens are placeholders that get replaced with data from your CSV file during generation.

### Available Tokens

| Token | CSV Column | Description | Example |
|-------|------------|-------------|---------|
| `{{domain}}` | `domain` | Website domain | `plumber-london.co.uk` |
| `{{name}}` | `name` | Business name | `London Plumbers Ltd` |
| `{{phone}}` | `phone` | Phone number | `020 1234 5678` |
| `{{email}}` | `email` | Email address | `info@example.com` |
| `{{service_name}}` | `service_name` | Service/business type | `Plumber` |
| `{{city}}` | `address.city` | City name | `London` |
| `{{state}}` | `address.state` | State/region | `Greater London` |
| `{{country}}` | `address.country` | Country | `United Kingdom` |
| `{{postcode}}` | `address.postcode` | Postal code | `SW1A 1AA` |
| `{{street}}` | `address.street` | Street address | `123 Main Street` |
| `{{site_title}}` | `site_title` | Site title | `New York Cleaners in New York` |
| `{{meta_title}}` | `meta_title` | SEO page title | `NYC's Best Cleaners` |
| `{{meta_description}}` | `meta_description` | SEO meta description | `Cleaning in New York, NY.` |
| `{{logo_url}}` | `logo_url` | Logo filename | `luminious_logo.png` |

### CSV File Format

Your `websites.csv` file should look like this:

```csv
template,domain,name,service_name,address,phone,email,site_title,meta_title,meta_description,logo_url
base-template,plumbersbow.co.uk,New York Cleaners,cleaning,"{""street"":""1919 Broadway"",""city"":""New York"",""state"":""NY"",""country"":""US""}",212-555-1919,clean@newyorkcleaners.com,New York Cleaners in New York,NYC's Best Cleaners,"Cleaning in New York, NY.",luminious_logo.png
idol-template,miami.plumbersbow.co.uk,Miami Plumbing,plumbing,"{""street"":""2121 Ocean Dr"",""city"":""Miami"",""state"":""FL"",""country"":""US""}",305-555-2121,plumb@miamiplumbing.com,Miami Plumbing in Miami,Miami's Top Plumbers,"Plumbing services in Miami, FL.",Star-Electric-logo.png
```

### Required CSV Columns

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `template` | ✅ **YES** | Template folder name (CRITICAL) | `base-template`, `idol-template` |
| `domain` | ✅ **YES** | Website domain | `plumbersbow.co.uk` |
| `name` | ✅ **YES** | Business/company name | `New York Cleaners` |
| `service_name` | ✅ **YES** | Service type | `cleaning`, `plumbing` |
| `address` | ✅ **YES** | JSON string with address data | See below |
| `phone` | ✅ **YES** | Contact phone number | `212-555-1919` |
| `email` | ✅ **YES** | Contact email | `clean@newyorkcleaners.com` |
| `site_title` | ✅ **YES** | Full site title | `New York Cleaners in New York` |
| `meta_title` | ✅ **YES** | SEO meta title | `NYC's Best Cleaners` |
| `meta_description` | ✅ **YES** | SEO meta description | `Cleaning in New York, NY.` |
| `logo_url` | ✅ **YES** | Logo filename | `luminious_logo.png` |

**CRITICAL:** The `template` column must match exactly with a folder name in the `templates/` directory. Without this, the generator will fail.

**Address Format:** The `address` column is a JSON string containing:
```json
{
  "street": "1919 Broadway",
  "city": "New York",
  "state": "NY",
  "country": "US"
}
```

**Note:** The `postcode` field is optional in the address JSON.

### Using Tokens

#### 1. In Text Content
```astro
<h1>Welcome to {{name}}</h1>
<p>Call us at {{phone}} or email {{email}}</p>
<p>Located in {{city}}, {{state}}, {{country}}</p>
```

**Output:**
```html
<h1>Welcome to New York Cleaners</h1>
<p>Call us at 212-555-1919 or email clean@newyorkcleaners.com</p>
<p>Located in New York, NY, US</p>
```

#### 2. In HTML Attributes
```astro
<a href="tel:{{phone}}">Call {{phone}}</a>
<a href="mailto:{{email}}">Email Us</a>
<img src="{{logo_url}}" alt="{{name}} Logo" />
```

#### 3. In Meta Tags
```astro
<head>
  <title>{{meta_title}}</title>
  <meta name="description" content="{{meta_description}}" />
</head>
```

**Note:** SEO elements like JSON-LD structured data, Open Graph tags, and Twitter cards are automatically generated by the system's SEO handler during the build process. You only need to provide the basic `meta_title` and `meta_description` in your CSV.

#### 4. In Scripts
```astro
---
const pageTitle = "{{meta_title}}";
const contactPhone = "{{phone}}";
const serviceArea = "{{city}}, {{state}}";
---

<h1>{pageTitle}</h1>
<p>Serving {serviceArea}</p>
<a href={`tel:${contactPhone}`}>{contactPhone}</a>
```

#### 5. Multiple Tokens
```astro
<section>
  <h2>{{service_name}} Services in {{city}}</h2>
  <p>
    Contact {{name}} for professional {{service_name}} 
    services in {{city}}, {{state}}. Call {{phone}} today!
  </p>
  <address>
    {{street}}<br>
    {{city}}, {{state}}<br>
    {{country}}
  </address>
</section>
```

---

## SpintaxImagePreview

The `SpintaxImagePreview` function allows you to preview specific images during development while maintaining spintax functionality for production builds.

### How It Works

**During Development:**
```astro
---
import { SpintaxImagePreview } from "@repo/spintax-preview";
import img1 from "../assets/image1.jpg";
import img2 from "../assets/image2.jpg";
import img3 from "../assets/image3.jpg";

const heroImage = SpintaxImagePreview({
  spintaxItem: [img1, img2, img3],
  previewItemIndex: 0  // Shows img1 in development
});
---

<Image src={heroImage} alt="Hero image" />
```

**After Generation (Automatic Conversion):**
```astro
---
import img1 from "../assets/image1.jpg";
import img2 from "../assets/image2.jpg";
import img3 from "../assets/image3.jpg";

const heroImage = [[img1|img2|img3]];  // Converted to spintax
---

<Image src={heroImage} alt="Hero image" />
```

The import statement for `SpintaxImagePreview` is automatically removed.

### Basic Usage

#### Step 1: Import Images and Function
```astro
---
import { Image } from "astro:assets";
import { SpintaxImagePreview } from "@repo/spintax-preview";

import hero1 from "../assets/hero/professional-electrician.jpg";
import hero2 from "../assets/hero/certified-technician.jpg";
import hero3 from "../assets/hero/electrical-panel-work.jpg";
---
```

#### Step 2: Create Image Variable
```astro
---
const heroImage = SpintaxImagePreview({
  spintaxItem: [hero1, hero2, hero3],
  previewItemIndex: 0  // Change to preview different images
});
---
```

#### Step 3: Use in Image Component
```astro
<Image 
  src={heroImage} 
  alt="[[Professional|Certified]] electrician at work"
  width={1200}
  height={800}
  loading="eager"
/>
```

### Preview Index

Change `previewItemIndex` to preview different images during development:

```astro
previewItemIndex: 0  // First image (hero1)
previewItemIndex: 1  // Second image (hero2)
previewItemIndex: 2  // Third image (hero3)
```

**Out of bounds behavior:**
- If index is negative or greater than array length, it returns the last image
- This ensures you always see something during development

### Multiple Image Spintax

```astro
---
import { SpintaxImagePreview } from "@repo/spintax-preview";

// Service images
import service1 from "../assets/services/electrical-installation.jpg";
import service2 from "../assets/services/electrical-repair.jpg";
import service3 from "../assets/services/electrical-maintenance.jpg";

// Team images
import team1 from "../assets/team/electrician-1.jpg";
import team2 from "../assets/team/electrician-2.jpg";

const serviceImage = SpintaxImagePreview({
  spintaxItem: [service1, service2, service3],
  previewItemIndex: 0
});

const teamImage = SpintaxImagePreview({
  spintaxItem: [team1, team2],
  previewItemIndex: 1  // Different preview
});
---

<section>
  <Image src={serviceImage} alt="Service image" />
  <Image src={teamImage} alt="Team image" />
</section>
```

### Using in Arrays/Loops

```astro
---
import { SpintaxImagePreview } from "@repo/spintax-preview";
import service1 from "../assets/service1.jpg";
import service2 from "../assets/service2.jpg";
import service3 from "../assets/service3.jpg";

const services = [
  {
    title: "Installation",
    image: SpintaxImagePreview({
      spintaxItem: [service1, service2, service3],
      previewItemIndex: 0
    })
  },
  {
    title: "Repair",
    image: SpintaxImagePreview({
      spintaxItem: [service1, service2, service3],
      previewItemIndex: 1
    })
  },
  {
    title: "Maintenance",
    image: SpintaxImagePreview({
      spintaxItem: [service1, service2, service3],
      previewItemIndex: 2
    })
  }
];
---

{services.map(service => (
  <div>
    <Image src={service.image} alt={service.title} />
    <h3>{service.title}</h3>
  </div>
))}
```

### Image Organization

Organize images in logical folders:

```
src/assets/
├── hero-images/
│   ├── hero1.jpg
│   ├── hero2.jpg
│   └── hero3.jpg
├── services/
│   ├── installation.jpg
│   ├── repair.jpg
│   └── maintenance.jpg
├── team/
│   ├── electrician-1.jpg
│   └── electrician-2.jpg
└── testimonials/
    ├── customer-1.jpg
    └── customer-2.jpg
```

### Image Alt Text with Spintax

Combine image spintax with text spintax in alt attributes:

```astro
<Image
  src={heroImage}
  alt="[[Professional|Certified|Expert]] [[electrician|technician]] 
       performing [[installation|repair|maintenance]] work"
  loading="eager"
/>
```

---

## Combining Spintax and Tokens

The real power comes from combining spintax variations with CSV tokens.

### Basic Combination

```astro
<h1>[[Professional|Expert|Certified]] {{service_name}} in {{city}}</h1>
```

**With CSV data:**
- `service_name`: "cleaning"
- `city`: "New York"

**Possible outputs:**
- "Professional cleaning in New York"
- "Expert cleaning in New York"
- "Certified cleaning in New York"

### Complex Combinations

```astro
<section>
  <h2>
    [[Best|Top-Rated|Leading]] {{service_name}} 
    [[Services|Solutions|Specialists]] in {{city}}
  </h2>
  
  <p>
    [[Contact|Call|Reach]] {{name}} for 
    [[fast|quick|rapid]] and [[reliable|dependable|professional]] 
    {{service_name}} service in {{city}}, {{state}}.
  </p>
  
  <p>
    [[Phone|Call|Ring]]: <a href="tel:{{phone}}">{{phone}}</a><br>
    [[Email|Contact]]: <a href="mailto:{{email}}">{{email}}</a>
  </p>
</section>
```

### Full Page Example

```astro
---
import { Image } from "astro:assets";
import { SpintaxImagePreview } from "@repo/spintax-preview";
import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";

const heroImage = SpintaxImagePreview({
  spintaxItem: [hero1, hero2],
  previewItemIndex: 0
});

const pageTitle = "{{meta_title}}";
const pageDescription = "{{meta_description}}";
---

<html lang="en">
<head>
  <title>{pageTitle}</title>
  <meta name="description" content={pageDescription} />
</head>
<body>
  <header>
    <img src="{{logo_url}}" alt="{{name}} Logo" />
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
      <a href="/services">Services</a>
      <a href="/contact">Contact</a>
    </nav>
  </header>

  <main>
    <section class="hero">
      <Image 
        src={heroImage} 
        alt="[[Professional|Expert]] {{service_name}} in {{city}}"
      />
      
      <h1>
        [[Welcome to|Trusted|Professional]] {{name}}
      </h1>
      
      <p>
        [[Leading|Top|Best]] {{service_name}} [[services|solutions]] 
        in {{city}}, {{state}}. [[Call|Contact|Reach out]] today 
        for [[fast|quick|immediate]] [[assistance|service|help]].
      </p>
      
      <a href="tel:{{phone}}" class="cta-button">
        [[Call Now|Contact Us|Get Quote]]: {{phone}}
      </a>
    </section>

    <section class="about">
      <h2>About {{name}}</h2>
      <p>
        {{name}} has been [[serving|helping|supporting]] 
        [[residents|customers|clients]] in {{city}} for 
        [[many years|over a decade]]. Our [[experienced|skilled|certified]] 
        {{service_name}} team [[provides|delivers|offers]] 
        [[exceptional|outstanding|top-quality]] service.
      </p>
    </section>

    <section class="contact">
      <h2>[[Contact|Reach]] Us</h2>
      <address>
        <strong>{{name}}</strong><br>
        {{street}}<br>
        {{city}}, {{state}}<br>
        {{country}}
      </address>
      <p>
        Phone: <a href="tel:{{phone}}">{{phone}}</a><br>
        Email: <a href="mailto:{{email}}">{{email}}</a>
      </p>
    </section>
  </main>
</body>
</html>
```

---

## Best Practices

### Spintax Best Practices

#### ✅ DO:

1. **Keep variations semantically similar**
   ```astro
   <!-- Good -->
   [[Professional|Expert|Certified]] Electrician
   ```

2. **Use appropriate variation counts**
   ```astro
   <!-- Good: 2-5 variations -->
   [[Fast|Quick|Rapid|Swift]] response
   ```

3. **Match grammatical structure**
   ```astro
   <!-- Good -->
   We [[provide|offer|deliver]] quality service
   ```

4. **Test all variations**
   - Read each possible output
   - Ensure all make sense
   - Check grammar and flow

5. **Use weighted spintax for emphasis**
   ```astro
   <!-- Good: Prefer "Emergency" -->
   [[Emergency~3|Urgent~1|Fast~1]] Service
   ```

#### ❌ DON'T:

1. **Mix unrelated content**
   ```astro
   <!-- Bad -->
   [[Professional Services|Call Now|£99 Offer]]
   ```

2. **Over-nest spintax**
   ```astro
   <!-- Bad: Too complex -->
   [[A|[[B|[[C|[[D|E]]]]]]]]
   ```

3. **Use too many variations**
   ```astro
   <!-- Bad: 15+ options is excessive -->
   [[opt1|opt2|opt3|opt4|opt5|opt6|opt7|opt8|opt9|opt10|...]]
   ```

4. **Break sentence structure**
   ```astro
   <!-- Bad -->
   We [[are professionals|quickly]] [[respond|service]]
   ```

### Token Best Practices

#### ✅ DO:

1. **Use tokens for all dynamic data**
   ```astro
   <!-- Good -->
   <a href="tel:{{phone}}">{{phone}}</a>
   ```

2. **Combine tokens naturally**
   ```astro
   <!-- Good -->
   Serving {{city}}, {{state}}, {{country}}
   ```

3. **Verify CSV data is complete**
   - Check all required columns exist
   - Validate data format
   - Test with sample data

#### ❌ DON'T:

1. **Hardcode values that should be tokens**
   ```astro
   <!-- Bad -->
   <h1>Plumber in London</h1>
   
   <!-- Good -->
   <h1>{{service_name}} in {{city}}</h1>
   ```

2. **Use incorrect token names**
   ```astro
   <!-- Bad: Token doesn't exist -->
   {{business_phone}}
   {{business_name}}  <!-- Use {{name}} instead -->
   
   <!-- Good -->
   {{phone}}
   {{name}}
   ```

### Image Spintax Best Practices

#### ✅ DO:

1. **Use semantically similar images**
   - Same subject matter
   - Similar composition
   - Same aspect ratio

2. **Organize images logically**
   ```
   assets/
   ├── hero-images/
   ├── services/
   └── team/
   ```

3. **Use descriptive filenames**
   ```astro
   import professionalElectrician from "../assets/professional-electrician.jpg";
   ```

4. **Preview different images during development**
   ```astro
   previewItemIndex: 0  // Change to see different images
   ```

#### ❌ DON'T:

1. **Mix image orientations**
   ```astro
   <!-- Bad: portrait + landscape -->
   SpintaxImagePreview({
     spintaxItem: [portrait1, landscape1, portrait2]
   })
   ```

2. **Use too many images**
   ```astro
   <!-- Bad: 20+ images is excessive -->
   spintaxItem: [img1, img2, img3, ..., img20]
   ```

3. **Use generic filenames**
   ```astro
   <!-- Bad -->
   import image1 from "../assets/1.jpg";
   import img from "../assets/img.png";
   ```

---

## Common Mistakes

### 1. Spintax Not Processing

❌ **Problem:**
```astro
<!-- Still shows: [[option1|option2]] -->
```

✅ **Solutions:**
- Ensure file ends in `.astro`
- Check spintax is in HTML section, not `<script>` or `<style>`
- Verify syntax: `[[option1|option2]]` (no spaces after `[[` or before `]]`)

### 2. Tokens Not Replacing

❌ **Problem:**
```astro
<!-- Still shows: {{domain}} -->
```

✅ **Solutions:**
- Verify CSV has the column
- Check spelling matches exactly (case-sensitive)
- Ensure token is in `.astro` file

### 3. SpintaxImagePreview Import Remains

❌ **Problem:**
```
Build error: Cannot find module '@repo/spintax-preview'
```

✅ **Solution:**
```astro
<!-- Must assign to variable -->
---
const img = SpintaxImagePreview({...});
---
<Image src={img} />

<!-- Don't use directly in src attribute -->
```

### 4. Malformed Spintax

❌ **Problem:**
```astro
<!-- Missing closing brackets -->
<h1>[[Professional|Expert Electrician</h1>

<!-- Extra spaces -->
<h1>[[ Professional | Expert ]]</h1>
```

✅ **Solution:**
```astro
<h1>[[Professional|Expert]] Electrician</h1>
```

### 5. Spintax in Wrong Context

❌ **Problem:**
```astro
<script>
  const title = "[[Professional|Expert]]"; // Won't process
</script>
```

✅ **Solution:**
```astro
---
const titleOptions = "[[Professional|Expert]]"; // Won't process here either
---

<!-- Will process here -->
<h1>[[Professional|Expert]] Services</h1>
```

---

## Examples

### Example 1: Homepage Hero Section

```astro
---
import { Image } from "astro:assets";
import { SpintaxImagePreview } from "@repo/spintax-preview";

import hero1 from "../assets/hero/electrician-working.jpg";
import hero2 from "../assets/hero/electrical-panel.jpg";
import hero3 from "../assets/hero/certified-technician.jpg";

const heroImage = SpintaxImagePreview({
  spintaxItem: [hero1, hero2, hero3],
  previewItemIndex: 0
});
---

<section class="hero">
  <div class="content">
    <h1>
      [[Professional|Expert|Certified]] {{service_name}} 
      [[Services|Solutions]] in {{city}}
    </h1>
    
    <p>
      [[Trusted|Reliable|Professional]] {{service_name}} 
      [[serving|helping|supporting]] {{city}} and {{state}}. 
      [[Available|Ready|Here to help]] [[24/7|round the clock]].
    </p>
    
    <div class="cta-buttons">
      <a href="tel:{{phone}}" class="btn-primary">
        [[Call Now|Contact Us|Get Quote]]: {{phone}}
      </a>
      <a href="mailto:{{email}}" class="btn-secondary">
        [[Email Us|Get in Touch]]
      </a>
    </div>
  </div>
  
  <div class="image">
    <Image 
      src={heroImage}
      alt="[[Professional|Certified|Expert]] {{service_name}} 
           in {{city}} - [[Installation|Repair|Maintenance]] services"
      width={800}
      height={600}
      loading="eager"
    />
  </div>
</section>
```

### Example 2: Services Section

```astro
---
import { SpintaxImagePreview } from "@repo/spintax-preview";

import service1 from "../assets/services/installation.jpg";
import service2 from "../assets/services/repair.jpg";
import service3 from "../assets/services/maintenance.jpg";

const services = [
  {
    title: "[[Installation|Setup|New Installation]]",
    image: SpintaxImagePreview({
      spintaxItem: [service1, service2, service3],
      previewItemIndex: 0
    }),
    description: "[[Professional|Expert]] installation [[services|solutions]] for [[homes|residential properties]] and [[businesses|commercial properties]]."
  },
  {
    title: "[[Repair|Fixing|Repair Services]]",
    image: SpintaxImagePreview({
      spintaxItem: [service1, service2, service3],
      previewItemIndex: 1
    }),
    description: "[[Fast|Quick|Rapid]] [[repair|fix]] service [[available|ready]] [[24/7|around the clock]]."
  },
  {
    title: "[[Maintenance|Regular Maintenance]]",
    image: SpintaxImagePreview({
      spintaxItem: [service1, service2, service3],
      previewItemIndex: 2
    }),
    description: "[[Scheduled|Regular|Routine]] maintenance to [[keep|ensure]] your [[systems|equipment]] [[running smoothly|in top condition]]."
  }
];
---

<section class="services">
  <h2>Our {{service_name}} [[Services|Solutions]] in {{city}}</h2>
  
  <div class="service-grid">
    {services.map(service => (
      <div class="service-card">
        <Image src={service.image} alt={service.title} />
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <a href="/contact">[[Learn More|Get Quote|Contact Us]]</a>
      </div>
    ))}
  </div>
</section>
```

### Example 3: Contact Section

```astro
<section class="contact">
  <h2>[[Contact|Reach|Get in Touch With]] {{name}}</h2>
  
  <div class="contact-info">
    <div class="info-block">
      <h3>[[Phone|Call Us]]</h3>
      <p>
        [[Available|Ready to help]] [[24/7|around the clock]]<br>
        <a href="tel:{{phone}}">{{phone}}</a>
      </p>
    </div>
    
    <div class="info-block">
      <h3>[[Email|Email Us]]</h3>
      <p>
        [[Quick|Fast]] response [[guaranteed|assured]]<br>
        <a href="mailto:{{email}}">{{email}}</a>
      </p>
    </div>
    
    <div class="info-block">
      <h3>[[Location|Address|Find Us]]</h3>
      <address>
        <strong>{{name}}</strong><br>
        {{street}}<br>
        {{city}}, {{state}}<br>
        {{country}}
      </address>
    </div>
  </div>
  
  <p class="service-area">
    [[Proudly serving|Serving|Helping customers in]] {{city}}, 
    {{state}}, and [[surrounding areas|nearby locations]].
  </p>
</section>
```

### Example 4: About Section

```astro
<section class="about">
  <h2>About {{name}}</h2>
  
  <div class="about-content">
    <p>
      {{name}} is a [[leading|top|trusted]] {{service_name}} 
      [[company|service provider|business]] [[based|located]] in {{city}}, {{state}}. 
      We [[specialize|focus]] in [[providing|delivering|offering]] 
      [[high-quality|exceptional|top-tier]] {{service_name}} 
      [[services|solutions]] to [[residential|homeowners]] and 
      [[commercial|business]] customers.
    </p>
    
    <p>
      Our [[team|staff]] of [[experienced|skilled|certified]] 
      [[professionals|technicians|experts]] is [[committed|dedicated]] 
      to [[providing|delivering]] [[excellent|outstanding|exceptional]] 
      [[service|customer care]] and [[ensuring|guaranteeing]] 
      [[complete|total|full]] [[customer satisfaction|client satisfaction]].
    </p>
    
    <p>
      [[Contact|Call|Reach]] us [[today|now]] at 
      <a href="tel:{{phone}}">{{phone}}</a> or 
      <a href="mailto:{{email}}">{{email}}</a> for 
      [[more information|a free quote|to schedule service]].
    </p>
  </div>
</section>
```

---

## Summary

### Key Points to Remember

1. **Spintax**: Use `[[option1|option2]]` for random variations
2. **Tokens**: Use `{{token_name}}` for CSV data replacement
3. **Images**: Use `SpintaxImagePreview` during development
4. **Combination**: Mix spintax and tokens for unique content
5. **Processing**: Only works in `.astro` files' HTML sections

### Quick Checklist

- [ ] Spintax uses correct syntax: `[[option1|option2]]`
- [ ] Tokens match CSV column names exactly
- [ ] Images imported correctly
- [ ] `SpintaxImagePreview` assigned to variables
- [ ] All variations make grammatical sense
- [ ] CSV data is complete and properly formatted
- [ ] Tested template locally before generation
