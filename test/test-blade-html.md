# Blade HTML Test

## View層の実装

```html:resources/views/message/edit.blade.php
@extends('layouts.master', ['manual' => 'message_edit'])
@section('content')
<div id="message" class="container screen_full edit message-edit">
    <form id="editform" method="post" action="/message/save{{$target}}" enctype="multipart/form-data">
        {{csrf_field()}}
        <table class="message_row_table">
            <tr>
                <th>送信者</th>
                <td>
                    <select name="sender" class="slct">
                        <option value="">--</option>
                    </select>
                </td>
            </tr>
        </table>
    </form>
</div>
@endsection
```

## After HTML Block - This should be visible

This text should appear after the HTML block.