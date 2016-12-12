<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ include file="../../../../../WEB-INF/includes/taglibs.jinc" %>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>
${ model.text is empty ? '' : model.text }
${ model.text is empty ? '#Lipsum' : model.text }
${ model.text.concat('x').concat('y').concat('z') }
${ ['one', two] is empty ? '' : ['one', two] }
