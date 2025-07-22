# PHP Code Block Test

## Normal PHP

```php
<?php
class Test {
    public function hello() {
        echo "Hello!";
    }
}
```

## PHP with Title

```php:app/Http/Controllers/TestController.php
<?php
namespace App\Http\Controllers;

class TestController extends Controller
{
    public function index()
    {
        return view('test.index');
    }
}
```

## After PHP - This should be visible

This text should be visible after the PHP code block.