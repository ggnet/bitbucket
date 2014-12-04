(function(){
// ==UserScript==
// @name        Branch features
// @namespace   bitbucket
// @description Extend bitbucket issue tracker with create, view, pull request links.
// @grant       none
// @grant       GM_addStyle
// @license     Branch features is released under the MIT License. Included third-party software are limited to their respective licenses.
// @version     2.1
// @include     https://bitbucket.org/*/issue/*
//
// ==/UserScript==

    (function(){

        GM_addStyle('.my-repo {border: 1px solid #ccc; border-radius: 5px; padding: 10px; margin-top:10px;}');
        var branchUrlRel = $('#repo-create-branch-link').attr('href');
        var branchUrl  = 'https://bitbucket.org' + branchUrlRel + '/';

        function slugify(string) {
            return string
                .trim()
                .replace(/[^\w\s\./-]/g, '')
                .replace(/\/\/+/g, '/')
                .replace(/\/$/g, '')
                .replace(/^\//g, '')
                .replace(/\s+/g, '-');
        }

        function addCreateBranchButton(){
            $( ".aui-item.page-actions" ).prepend('<a id="create-branch-contextual" href="' + branchUrlRel + '" class="create-branch-button aui-button aui-button-subtle"><span class="aui-icon icon-create-branch"></span><span class="aui-nav-item-label">Create branch</span></a>');
        }

        function generateBranchName()
        {
            var branchName = $.trim($('.issue-id').text()) + ' ' + $.trim($('#issue-title').text());
            branchName = slugify(branchName);
            return branchName;
        }

        var branchName = generateBranchName();

        AJS.bind("show.dialog", function(e, data) {
            branchName = slugify(branchName);

            $('#id_branch_name').val(branchName);
        });

        addCreateBranchButton();
        // generate current branch url
        var currentBranchUrl = branchUrl + branchName;
        $.get( currentBranchUrl, function(data, textStatus, jqXHR ) {
            $('.issue-attrs').after(
                '<div class="issue-attrs my-repo">'
                + '<dl>'
                + '<dt>Branch<dt><dd><a href="' + currentBranchUrl + '" title="' + branchName + '">' + branchName + '</a></dd>'
                + '</dl>'
                +'</div>'
            );

            var html = jqXHR.responseText;

            var branchPage = $(html);
            if ($(branchPage).find('#compare-tabs').length) {
                var info = '<dt><span class="aui-icon aui-icon-small aui-iconfont-devtools-pull-request" title="Pull requests">Pull requests</span></dt>'
                + $(branchPage).find('.compare-metadata dd:first')[0].outerHTML;

                $('.my-repo dl').append(info);
            }

        }).fail(function(){
            $('.issue-attrs').after(
                '<div class="issue-attrs">Branch not found. </div>'
            );
        });

    })();
})();