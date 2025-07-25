# PHP and HTML Mix Test

## Controller層

```php:app/Http/Controllers/MessagesCtrl.php
namespace App\Http\Controllers;

class MessagesCtrl extends Controller
{
    public function index() // 一覧表示
}
```

## View層の実装

```html:resources/views/message/edit.blade.php
@extends('layouts.master', ['manual' => 'message_edit'])
@section('content')
<div id="message" class="container">
    {{csrf_field()}}
</div>
@endsection
```

## After Both Blocks

This text should be visible.